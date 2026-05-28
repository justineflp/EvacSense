const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { signToken } = require('../services/jwtService');
const { logEvent } = require('../services/sessionLogger');

/**
 * Maps system roles to their correct web/mobile dashboards.
 */
function getRoleRedirect(role) {
  switch (role) {
    case 'Student': return '/student-dashboard';
    case 'Teacher': return '/teacher-dashboard';
    case 'Drill Coordinator': return '/coordinator-dashboard';
    case 'System Admin': return '/admin-dashboard';
    default: return '/';
  }
}

// 1. Password-Based Login
async function login(req, res) {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing email or password credentials.',
        errors: ['Both email and password are required.']
      });
    }

    // Domain verification
    if (!email.endsWith('@cit.edu') && !email.endsWith('@student.cit.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Access Restricted.',
        errors: ['Only institutional emails (@cit.edu or @student.cit.edu) are accepted.']
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      await logEvent('failed_attempt', email, ip, 'Login failed: Account not found');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
        errors: ['User account does not exist.']
      });
    }

    // Check if account is locked
    if (user.status === 'locked') {
      await logEvent('failed_attempt', email, ip, 'Login blocked: Account locked');
      return res.status(403).json({
        status: 'locked',
        action: 'login',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
        session: null,
        redirect: null,
        auditLog: { event: 'failed_attempt', timestamp: new Date().toISOString(), ipAddress: ip },
        message: 'Your account has been locked due to 3 failed login attempts. Contact an Admin.',
        errors: ['Account status is locked.']
      });
    }

    // Check if account is Pending Approval
    if (user.status === 'Pending Approval') {
      await logEvent('failed_attempt', email, ip, 'Login blocked: Account pending approval');
      return res.status(403).json({
        status: 'error',
        action: 'login',
        user: null,
        session: null,
        redirect: null,
        auditLog: { event: 'failed_attempt', timestamp: new Date().toISOString(), ipAddress: ip },
        message: 'Account pending admin approval',
        errors: ['This account requires administrator review before activation.']
      });
    }

    // Check if account was Rejected
    if (user.status === 'Rejected') {
      await logEvent('failed_attempt', email, ip, 'Login blocked: Account rejected');
      return res.status(403).json({
        status: 'error',
        action: 'login',
        user: null,
        session: null,
        redirect: null,
        auditLog: { event: 'failed_attempt', timestamp: new Date().toISOString(), ipAddress: ip },
        message: 'Your registration request has been rejected by an administrator.',
        errors: ['Registration request rejected.']
      });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const attempts = user.failedAttempts + 1;
      let status = 'active';
      let message = 'Invalid email or password credentials.';

      if (attempts >= 3) {
        status = 'locked';
        message = 'Your account has been locked due to 3 failed login attempts. Please contact IT support.';
        await user.update({ failedAttempts: attempts, status: 'locked' });
        await logEvent('failed_attempt', email, ip, `Account locked due to ${attempts} failed attempts`);
      } else {
        await user.update({ failedAttempts: attempts });
        await logEvent('failed_attempt', email, ip, `Login failed: Incorrect password (attempt ${attempts}/3)`);
      }

      return res.status(401).json({
        status: status === 'locked' ? 'locked' : 'error',
        action: 'login',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
        session: null,
        redirect: null,
        auditLog: { event: 'failed_attempt', timestamp: new Date().toISOString(), ipAddress: ip },
        message,
        errors: [`Authentication failed. Attempt ${attempts} of 3.`]
      });
    }

    // On Success: Reset failed attempts and issue token
    await user.update({ failedAttempts: 0 });
    const token = signToken(user);
    await logEvent('login', email, ip, 'Successful login');

    return res.status(200).json({
      status: 'success',
      action: 'login',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      session: { token, expiresIn: '1 hour', isValid: true },
      redirect: getRoleRedirect(user.role),
      auditLog: { event: 'login', timestamp: new Date().toISOString(), ipAddress: ip },
      message: `Welcome back, ${user.name}!`,
      errors: []
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      errors: [error.message]
    });
  }
}

// 2. Simulated Google Single Sign-On (SSO)
async function googleSSO(req, res) {
  const { email, name, googleToken } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (!email || !googleToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Google Auth signature is missing.',
        errors: ['Google verification token and email are required.']
      });
    }

    // Strictly validate domain
    if (!email.endsWith('@cit.edu') && !email.endsWith('@student.cit.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Access Restricted.',
        errors: ['Only institutional Google accounts (@cit.edu or @student.cit.edu) are accepted.']
      });
    }

    // Validate simulated SSO token
    if (googleToken === 'EXPIRED_TOKEN') {
      return res.status(401).json({
        status: 'error',
        message: 'SSO Login Failed.',
        errors: ['The Google Auth token has expired or is invalid.']
      });
    }

    let user = await User.findOne({ where: { email } });

    // Dynamic Registration if user doesn't exist
    if (!user) {
      const defaultRole = email.endsWith('@student.cit.edu') ? 'Student' : 'Teacher';
      const defaultDept = email.endsWith('@student.cit.edu') ? 'BS Computer Science' : 'College of Computer Studies';
      const idSeed = Math.floor(100 + Math.random() * 900);
      const newId = `USR-${idSeed}`;

      user = await User.create({
        id: newId,
        name: name || 'Google SSO User',
        email,
        role: defaultRole,
        department: defaultDept,
        failedAttempts: 0,
        status: 'active'
      });
      await logEvent('login', email, ip, `SSO dynamic registration completed for ${newId}`);
    } else {
      if (user.status === 'locked') {
        await logEvent('failed_attempt', email, ip, 'SSO login blocked: Account locked');
        return res.status(403).json({
          status: 'locked',
          action: 'google_sso',
          user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
          session: null,
          redirect: null,
          auditLog: { event: 'failed_attempt', timestamp: new Date().toISOString(), ipAddress: ip },
          message: 'Your account is locked. Please contact your administrator.',
          errors: ['Account status is locked.']
        });
      }

      if (user.status === 'Pending Approval') {
        await logEvent('failed_attempt', email, ip, 'SSO login blocked: Account pending approval');
        return res.status(403).json({
          status: 'error',
          action: 'google_sso',
          user: null,
          session: null,
          redirect: null,
          auditLog: { event: 'failed_attempt', timestamp: new Date().toISOString(), ipAddress: ip },
          message: 'Account pending admin approval',
          errors: ['This account requires administrator review before activation.']
        });
      }
    }

    const token = signToken(user);
    await logEvent('login', email, ip, 'Google SSO Login Successful');

    return res.status(200).json({
      status: 'success',
      action: 'login',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      session: { token, expiresIn: '1 hour', isValid: true },
      redirect: getRoleRedirect(user.role),
      auditLog: { event: 'login', timestamp: new Date().toISOString(), ipAddress: ip },
      message: `Welcome back via Google SSO, ${user.name}!`,
      errors: []
    });

  } catch (error) {
    console.error('Google SSO error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      errors: [error.message]
    });
  }
}

// 3. Register Student Account (Self-Registration, auto-activated)
async function registerStudent(req, res) {
  const { name, email, studentId, password, deviceId } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (!name || !email || !studentId || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid submission.',
        errors: ['All registration fields (name, email, student ID, password) are required.']
      });
    }

    if (!email.endsWith('@student.cit.edu') && !email.endsWith('@cit.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Registration Filter Rejection.',
        errors: ['Students must register using a valid institutional email (@student.cit.edu or @cit.edu).']
      });
    }

    // Check duplicate email or ID
    const exists = await User.findOne({
      where: sequelizeFindOr({ email, id: studentId })
    });
    if (exists) {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate Account Detected.',
        errors: ['An account with this email or Student ID has already been registered in EvacSense.']
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      id: studentId,
      name,
      email,
      passwordHash,
      role: 'Student',
      department: 'BS Information Technology',
      deviceId,
      failedAttempts: 0,
      status: 'active'
    });

    await logEvent('login', email, ip, `Student account self-registration verified. ID: ${studentId}`);

    return res.status(201).json({
      status: 'success',
      action: 'registration',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      session: null,
      redirect: '/',
      auditLog: { event: 'login', timestamp: new Date().toISOString(), ipAddress: ip },
      message: 'Student Registration Successful! You can now log in securely.',
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Self-registration failed.',
      errors: [error.message]
    });
  }
}

// Helper for OR queries
function sequelizeFindOr(conditions) {
  const { Op } = require('sequelize');
  return {
    [Op.or]: Object.keys(conditions).map(k => ({ [k]: conditions[k] }))
  };
}

// 4. Register Teacher / Coordinator Account (requires Admin approval)
async function registerStaff(req, res) {
  const { name, email, employeeId, password, deviceId, role } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (!name || !email || !employeeId || !password || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid submission.',
        errors: ['All registration fields (name, email, employee ID, password, role) are required.']
      });
    }

    if (!email.endsWith('@cit.edu') && !email.endsWith('@student.cit.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Registration Filter Rejection.',
        errors: ['Staff/Faculty must register using a valid institutional email (@cit.edu or @student.cit.edu).']
      });
    }

    const validRoles = ['Teacher', 'Drill Coordinator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role assignment.',
        errors: ['Requested role must be Teacher or Drill Coordinator.']
      });
    }

    // Check duplicate
    const exists = await User.findOne({
      where: sequelizeFindOr({ email, id: employeeId })
    });
    if (exists) {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate Account Detected.',
        errors: ['An account with this email or Employee ID is already registered.']
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      id: employeeId,
      name,
      email,
      passwordHash,
      role,
      department: role === 'Teacher' ? 'College of Computer Studies' : 'Safety Office',
      deviceId,
      failedAttempts: 0,
      status: 'Pending Approval'
    });

    await logEvent('recovery', email, ip, `Staff registration request submitted. Role: ${role}, ID: ${employeeId}`);

    return res.status(201).json({
      status: 'pending',
      action: 'registration',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      session: null,
      redirect: '/',
      auditLog: { event: 'recovery', timestamp: new Date().toISOString(), ipAddress: ip },
      message: 'Account pending admin approval',
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Staff registration failed.',
      errors: [error.message]
    });
  }
}

// 5. List Pending Staff Registration Requests (Admin only)
async function listPendingRequests(req, res) {
  try {
    const requests = await User.findAll({
      where: { status: 'Pending Approval' },
      attributes: ['id', 'name', 'email', 'role', 'department', 'deviceId', 'createdAt']
    });
    return res.status(200).json({
      status: 'success',
      action: 'list_pending',
      user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      requests,
      message: 'Pending registration requests fetched successfully.',
      errors: []
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve pending list.',
      errors: [error.message]
    });
  }
}

// 6. Approve Staff Registration Request (Admin only)
async function approveRequest(req, res) {
  const { id } = req.params;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    const targetUser = await User.findOne({ where: { id, status: 'Pending Approval' } });
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Pending request not found.',
        errors: [`No pending request matched ID: ${id}`]
      });
    }

    await targetUser.update({ status: 'active' });
    await logEvent('role_update', targetUser.email, ip, `Registration request approved by Admin: ${req.user.email}`);

    return res.status(200).json({
      status: 'success',
      action: 'approve_registration',
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role },
      message: `Registration request for ${targetUser.name} has been approved successfully.`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Verification approval failed.',
      errors: [error.message]
    });
  }
}

// 7. Reject Staff Registration Request (Admin only)
async function rejectRequest(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required.',
        errors: ['You must provide a clear validation reason to reject a registration.']
      });
    }

    const targetUser = await User.findOne({ where: { id, status: 'Pending Approval' } });
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Pending request not found.',
        errors: [`No pending request matched ID: ${id}`]
      });
    }

    const name = targetUser.name;
    const email = targetUser.email;
    
    // We update status to Rejected and log the comment
    await targetUser.update({ status: 'Rejected' });
    await logEvent('role_update', email, ip, `Registration request REJECTED by Admin: ${req.user.email}. Reason: ${reason}`);

    return res.status(200).json({
      status: 'success',
      action: 'reject_registration',
      user: { id, name, email },
      message: `Registration request for ${name} was rejected. Reason: ${reason}`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Verification rejection failed.',
      errors: [error.message]
    });
  }
}

// 8. Account Recovery
async function recoverAccount(req, res) {
  const { email } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Recovery email is required.',
        errors: ['Email parameter is missing.']
      });
    }

    if (!email.endsWith('@cit.edu') && !email.endsWith('@student.cit.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Institutional Email.',
        errors: ['Only institutional emails are registered in EvacSense.']
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found.',
        errors: [`The institutional email '${email}' is not registered in the system.`]
      });
    }

    await logEvent('recovery', email, ip, 'Simulated password recovery link dispatched');

    return res.status(200).json({
      status: 'success',
      action: 'recovery',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      session: null,
      redirect: null,
      auditLog: { event: 'recovery', timestamp: new Date().toISOString(), ipAddress: ip },
      message: `Recovery email has been dispatched to ${email}. Please check your institutional inbox.`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred during account recovery.',
      errors: [error.message]
    });
  }
}

// 9. Token Validation Endpoint
async function validateToken(req, res) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  await logEvent('token_validation', req.user.email, ip, 'Token validation check successful');
  
  return res.status(200).json({
    status: 'success',
    action: 'token_validation',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department
    },
    session: {
      token: req.headers.authorization.split(' ')[1],
      expiresIn: '1 hour',
      isValid: true
    },
    redirect: getRoleRedirect(req.user.role),
    auditLog: { event: 'token_validation', timestamp: new Date().toISOString(), ipAddress: ip },
    message: 'Security token is valid.',
    errors: []
  });
}

// 10. Logout
async function logout(req, res) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  if (req.user) {
    await logEvent('logout', req.user.email, ip, 'User logged out successfully');
  }
  return res.status(200).json({
    status: 'success',
    action: 'logout',
    user: null,
    session: null,
    redirect: '/',
    auditLog: { event: 'logout', timestamp: new Date().toISOString(), ipAddress: ip },
    message: 'Logged out successfully. Session invalidated.',
    errors: []
  });
}

// 11. List Users (Admin only)
async function listUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'department', 'failedAttempts', 'status']
    });
    return res.status(200).json({
      status: 'success',
      action: 'list_users',
      user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, department: req.user.department },
      session: null,
      redirect: null,
      auditLog: { event: 'token_validation', timestamp: new Date().toISOString(), ipAddress: req.ip },
      users,
      message: 'All registered users fetched successfully.',
      errors: []
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not fetch user accounts.',
      errors: [error.message]
    });
  }
}

// 12. Update User Role (Admin only)
async function updateRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    const validRoles = ['Student', 'Teacher', 'Drill Coordinator', 'System Admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role assignment request.',
        errors: [`Role must be one of: ${validRoles.join(', ')}`]
      });
    }

    const targetUser = await User.findByPk(id);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Target user not found.',
        errors: [`No user found matching ID: ${id}`]
      });
    }

    const previousRole = targetUser.role;
    await targetUser.update({ role });
    await logEvent('role_update', targetUser.email, ip, `Role updated from '${previousRole}' to '${role}' by ${req.user.email}`);

    return res.status(200).json({
      status: 'success',
      action: 'role_update',
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role, department: targetUser.department },
      session: null,
      redirect: null,
      auditLog: { event: 'role_update', timestamp: new Date().toISOString(), ipAddress: ip },
      message: `Successfully updated ${targetUser.name}'s role from '${previousRole}' to '${role}'.`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update user role.',
      errors: [error.message]
    });
  }
}

module.exports = {
  login,
  googleSSO,
  registerStudent,
  registerStaff,
  listPendingRequests,
  approveRequest,
  rejectRequest,
  recoverAccount,
  validateToken,
  logout,
  listUsers,
  updateRole
};
