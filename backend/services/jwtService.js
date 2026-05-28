const jwt = require('jsonwebtoken');

// Secret key for JWT signature - in production, this must be sourced from process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'evacsense_ccs_secret_jwt_key_2026';

/**
 * Signs a session token for a user with a strict 1-hour expiration.
 * @param {Object} user 
 * @returns {String} JWT token
 */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Verifies a JWT token signature and decodes the user claims.
 * @param {String} token 
 * @returns {Object} decoded payload or throws an Error
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired. Please log in again.');
    }
    throw new Error('Invalid security token.');
  }
}

module.exports = {
  signToken,
  verifyToken
};
