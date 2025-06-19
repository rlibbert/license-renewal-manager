const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const auditLogger = require('../utils/auditLogger');
require('dotenv').config();

/**
 * Get all licenses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllLicenses = async (req, res) => {
  try {
    let query = 'SELECT * FROM licenses';
    const queryParams = [];
    
    // Handle search and filtering
    if (req.query.search) {
      // SQLite doesn't have ILIKE, use LIKE with lower() for case insensitivity
      query += ' WHERE lower(software_name) LIKE ? OR lower(vendor) LIKE ?';
      const searchTerm = `%${req.query.search.toLowerCase()}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    if (req.query.expirationStart && req.query.expirationEnd) {
      const connector = queryParams.length ? 'AND' : 'WHERE';
      query += ` ${connector} expiration_date BETWEEN ? AND ?`;
      queryParams.push(req.query.expirationStart, req.query.expirationEnd);
    } else if (req.query.expirationStart) {
      const connector = queryParams.length ? 'AND' : 'WHERE';
      query += ` ${connector} expiration_date >= ?`;
      queryParams.push(req.query.expirationStart);
    } else if (req.query.expirationEnd) {
      const connector = queryParams.length ? 'AND' : 'WHERE';
      query += ` ${connector} expiration_date <= ?`;
      queryParams.push(req.query.expirationEnd);
    }
    
    if (req.query.licenseType) {
      const connector = queryParams.length ? 'AND' : 'WHERE';
      query += ` ${connector} license_type = ?`;
      queryParams.push(req.query.licenseType);
    }
    
    if (req.query.contactEmail) {
      const connector = queryParams.length ? 'AND' : 'WHERE';
      query += ` ${connector} contact_email = ?`;
      queryParams.push(req.query.contactEmail);
    }
    
    // Add sorting
    query += ' ORDER BY expiration_date ASC';
    
    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting licenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific license by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLicenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM licenses WHERE id = ?', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting license:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new license
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLicense = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      software_name,
      vendor,
      license_type,
      purchase_date,
      expiration_date,
      auto_renewal,
      contact_name,
      contact_email,
      license_key,
      notes
    } = req.body;
    
    // Handle file upload if present
    let license_file_path = null;
    if (req.file) {
      const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR);
      
      // Create upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save file
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      
      license_file_path = `${process.env.UPLOAD_DIR}/${fileName}`;
    }
    
    // Insert new license
    const query = `
      INSERT INTO licenses (
        software_name, vendor, license_type, purchase_date, expiration_date,
        auto_renewal, contact_name, contact_email, license_key, license_file_path,
        notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      software_name,
      vendor,
      license_type,
      purchase_date,
      expiration_date,
      auto_renewal ? 1 : 0,
      contact_name,
      contact_email,
      license_key,
      license_file_path,
      notes,
      req.user.id
    ];
    
    const result = await db.run(query, values);
    
    // Get the inserted license
    const licenseResult = await db.query('SELECT * FROM licenses WHERE id = ?', [result.lastID]);
    const license = licenseResult.rows[0];
    
    // Log the activity
    await auditLogger.logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'licenses',
      recordId: license.id,
      changes: req.body,
      ipAddress: req.ip
    });
    
    res.status(201).json({
      message: 'License created successfully',
      license
    });
  } catch (error) {
    console.error('Error creating license:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a license
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLicense = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    
    // Check if license exists
    const licenseCheck = await db.query('SELECT * FROM licenses WHERE id = ?', [id]);
    
    if (licenseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    const existingLicense = licenseCheck.rows[0];
    
    const {
      software_name,
      vendor,
      license_type,
      purchase_date,
      expiration_date,
      auto_renewal,
      contact_name,
      contact_email,
      license_key,
      notes
    } = req.body;
    
    // Handle file upload if present
    let license_file_path = existingLicense.license_file_path;
    if (req.file) {
      const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR);
      
      // Create upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Delete old file if exists
      if (existingLicense.license_file_path) {
        const oldFilePath = path.join(__dirname, '..', existingLicense.license_file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Save new file
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      
      license_file_path = `${process.env.UPLOAD_DIR}/${fileName}`;
    }
    
    // Update license
    const query = `
      UPDATE licenses
      SET 
        software_name = ?,
        vendor = ?,
        license_type = ?,
        purchase_date = ?,
        expiration_date = ?,
        auto_renewal = ?,
        contact_name = ?,
        contact_email = ?,
        license_key = ?,
        license_file_path = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const values = [
      software_name || existingLicense.software_name,
      vendor || existingLicense.vendor,
      license_type || existingLicense.license_type,
      purchase_date || existingLicense.purchase_date,
      expiration_date || existingLicense.expiration_date,
      auto_renewal !== undefined ? (auto_renewal ? 1 : 0) : existingLicense.auto_renewal,
      contact_name || existingLicense.contact_name,
      contact_email || existingLicense.contact_email,
      license_key || existingLicense.license_key,
      license_file_path,
      notes || existingLicense.notes,
      id
    ];
    
    await db.run(query, values);
    
    // Get the updated license
    const updatedLicenseResult = await db.query('SELECT * FROM licenses WHERE id = ?', [id]);
    const updatedLicense = updatedLicenseResult.rows[0];
    
    // Log the activity
    await auditLogger.logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'licenses',
      recordId: updatedLicense.id,
      changes: req.body,
      ipAddress: req.ip
    });
    
    res.json({
      message: 'License updated successfully',
      license: updatedLicense
    });
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a license
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLicense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if license exists
    const licenseCheck = await db.query('SELECT * FROM licenses WHERE id = ?', [id]);
    
    if (licenseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    const existingLicense = licenseCheck.rows[0];
    
    // Delete file if exists
    if (existingLicense.license_file_path) {
      const filePath = path.join(__dirname, '..', existingLicense.license_file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete license
    await db.run('DELETE FROM licenses WHERE id = ?', [id]);
    
    // Log the activity
    await auditLogger.logActivity({
      userId: req.user.id,
      action: 'DELETE',
      tableName: 'licenses',
      recordId: id,
      changes: null,
      ipAddress: req.ip
    });
    
    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    console.error('Error deleting license:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get licenses expiring soon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getExpiringLicenses = async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    // SQLite date functions are different from PostgreSQL
    const query = `
      SELECT * FROM licenses
      WHERE date(expiration_date) BETWEEN date('now') AND date('now', '+${days} days')
      ORDER BY expiration_date ASC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting expiring licenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total licenses
    const totalLicensesResult = await db.query('SELECT COUNT(*) as count FROM licenses');
    const totalLicenses = parseInt(totalLicensesResult.rows[0].count);
    
    // Get licenses expiring in 30 days
    const expiringLicensesResult = await db.query(`
      SELECT COUNT(*) as count FROM licenses
      WHERE date(expiration_date) BETWEEN date('now') AND date('now', '+30 days')
    `);
    const expiringLicenses = parseInt(expiringLicensesResult.rows[0].count);
    
    // Get overdue licenses
    const overdueLicensesResult = await db.query(`
      SELECT COUNT(*) as count FROM licenses
      WHERE date(expiration_date) < date('now')
    `);
    const overdueLicenses = parseInt(overdueLicensesResult.rows[0].count);
    
    // Get recent activity
    const recentActivity = await auditLogger.getRecentActivity(5);
    
    res.json({
      totalLicenses,
      expiringLicenses,
      overdueLicenses,
      recentActivity
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  deleteLicense,
  getExpiringLicenses,
  getDashboardStats
};
