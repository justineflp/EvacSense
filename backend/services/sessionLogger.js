const AuditLog = require('../models/auditLogModel');

/**
 * Asynchronously log authentication events to the audit log table.
 * @param {String} event - The type of event (login, logout, failed_attempt, etc.)
 * @param {String} email - Email associated with the event
 * @param {String} ipAddress - Client IP address
 * @param {String} details - Optional descriptive information
 */
async function logEvent(event, email, ipAddress = '127.0.0.1', details = '') {
  try {
    await AuditLog.create({
      event,
      email,
      ipAddress: ipAddress || '127.0.0.1',
      details,
      timestamp: new Date()
    });
    console.log(`[AUDIT LOG] ${event.toUpperCase()} for ${email || 'Anonymous'} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to write audit log:', error);
  }
}

module.exports = {
  logEvent
};
