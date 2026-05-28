const { verifyToken } = require('../services/jwtService');
const User = require('../models/userModel');
const { logEvent } = require('../services/sessionLogger');

/**
 * Generates an RBAC middleware checking authorization claims against permitted roles.
 * @param {Array<String>} allowedRoles - List of authorized roles (e.g. ['System Admin', 'Drill Coordinator'])
 */
function authorize(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'Access Denied. No token provided.',
          errors: ['Authorization header is missing or malformed.']
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      // Verify the user exists in database and is active
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(403).json({
          status: 'error',
          message: 'Access Forbidden.',
          errors: ['User account associated with this token does not exist.']
        });
      }

      if (user.status === 'locked') {
        return res.status(403).json({
          status: 'locked',
          message: 'Your account is locked due to multiple failed login attempts.',
          errors: ['Account status is locked. Please contact your system administrator.']
        });
      }

      // Check if user role matches permitted roles
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Access Forbidden. Insufficient permissions.',
          errors: [`Role '${user.role}' is not authorized to access this resource.`]
        });
      }

      // Append user info to request context
      req.user = user;
      req.tokenData = decoded;
      
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed.',
        errors: [error.message]
      });
    }
  };
}

module.exports = authorize;
