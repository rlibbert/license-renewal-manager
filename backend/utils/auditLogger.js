const db = require('../database/db');

/**
 * Log an audit entry for CRUD operations
 * @param {Object} params - Audit log parameters
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Action performed (CREATE, READ, UPDATE, DELETE)
 * @param {string} params.tableName - Name of the table affected
 * @param {number} params.recordId - ID of the record affected
 * @param {Object} params.changes - JSON object containing the changes made
 * @param {string} params.ipAddress - IP address of the user
 */
const logActivity = async ({
  userId,
  action,
  tableName,
  recordId,
  changes,
  ipAddress
}) => {
  try {
    // Convert changes object to JSON string for SQLite
    const changesJson = changes ? JSON.stringify(changes) : null;
    
    const query = `
      INSERT INTO audit_logs (user_id, username, action, table_name, record_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // Get username if userId is provided
    let username = 'system';
    if (userId) {
      const userResult = await db.queryOne('SELECT username FROM users WHERE id = ?', [userId]);
      if (userResult.row) {
        username = userResult.row.username;
      }
    }
    
    const result = await db.run(query, [userId, username, action, tableName, recordId, changesJson]);
    
    return result.lastID;
  } catch (error) {
    console.error('Error logging audit activity:', error);
    // Don't throw the error - we don't want to fail the main operation if logging fails
    return null;
  }
};

/**
 * Get recent activity logs
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<Array>} - Array of audit log entries
 */
const getRecentActivity = async (limit = 10) => {
  try {
    const query = `
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
  getRecentActivity
};
