const cron = require('node-cron');
const db = require('../database/db');
const emailService = require('./emailService');

/**
 * Get licenses expiring within a specific number of days
 * @param {number} days - Number of days until expiration
 * @returns {Promise<Array>} - Array of licenses expiring within the specified days
 */
const getLicensesExpiringIn = async (days) => {
  try {
    // SQLite date functions are different from PostgreSQL
    const query = `
      SELECT * FROM licenses
      WHERE date(expiration_date) = date('now', '+${days} days')
    `;
    
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error(`Error getting licenses expiring in ${days} days:`, error);
    throw error;
  }
};

/**
 * Get all licenses that have already expired
 * @returns {Promise<Array>} - Array of expired licenses
 */
const getExpiredLicenses = async () => {
  try {
    // SQLite date functions
    const query = `
      SELECT * FROM licenses
      WHERE date(expiration_date) < date('now')
    `;
    
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting expired licenses:', error);
    throw error;
  }
};

/**
 * Send notifications for licenses expiring soon
 */
const sendExpirationNotifications = async () => {
  try {
    console.log('Checking for licenses expiring soon...');
    
    // Check for licenses expiring in 30 days
    const licenses30Days = await getLicensesExpiringIn(30);
    for (const license of licenses30Days) {
      await emailService.sendRenewalNotification(license, 30);
    }
    
    // Check for licenses expiring in 15 days
    const licenses15Days = await getLicensesExpiringIn(15);
    for (const license of licenses15Days) {
      await emailService.sendRenewalNotification(license, 15);
    }
    
    // Check for licenses expiring in 7 days
    const licenses7Days = await getLicensesExpiringIn(7);
    for (const license of licenses7Days) {
      await emailService.sendRenewalNotification(license, 7);
    }
    
    console.log('License expiration notifications sent successfully');
  } catch (error) {
    console.error('Error sending license expiration notifications:', error);
  }
};

/**
 * Start the cron job to check for licenses expiring soon
 */
const startLicenseCheckerCron = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', sendExpirationNotifications);
  console.log('License checker cron job scheduled');
};

module.exports = {
  getLicensesExpiringIn,
  getExpiredLicenses,
  sendExpirationNotifications,
  startLicenseCheckerCron
};
