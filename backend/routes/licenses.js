const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const licenseController = require('../controllers/licenseController');
const { verifyToken, isAdmin, isEditor, isViewer } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route   GET /api/licenses
 * @desc    Get all licenses
 * @access  Private (Viewer+)
 */
router.get('/', verifyToken, isViewer, licenseController.getAllLicenses);

/**
 * @route   GET /api/licenses/:id
 * @desc    Get license by ID
 * @access  Private (Viewer+)
 */
router.get('/:id', verifyToken, isViewer, licenseController.getLicenseById);

/**
 * @route   POST /api/licenses
 * @desc    Create a new license
 * @access  Private (Editor+)
 */
router.post(
  '/',
  verifyToken,
  isEditor,
  upload.single('licenseFile'),
  [
    check('software_name', 'Software name is required').not().isEmpty(),
    check('vendor', 'Vendor is required').not().isEmpty(),
    check('license_type', 'License type is required').not().isEmpty(),
    check('purchase_date', 'Purchase date is required').isDate(),
    check('expiration_date', 'Expiration date is required').isDate(),
    check('contact_name', 'Contact name is required').not().isEmpty(),
    check('contact_email', 'Valid contact email is required').isEmail()
  ],
  licenseController.createLicense
);

/**
 * @route   PUT /api/licenses/:id
 * @desc    Update a license
 * @access  Private (Editor+)
 */
router.put(
  '/:id',
  verifyToken,
  isEditor,
  upload.single('licenseFile'),
  [
    check('software_name', 'Software name is required').optional(),
    check('vendor', 'Vendor is required').optional(),
    check('license_type', 'License type is required').optional(),
    check('purchase_date', 'Purchase date must be a valid date').optional().isDate(),
    check('expiration_date', 'Expiration date must be a valid date').optional().isDate(),
    check('contact_name', 'Contact name is required').optional(),
    check('contact_email', 'Valid contact email is required').optional().isEmail()
  ],
  licenseController.updateLicense
);

/**
 * @route   DELETE /api/licenses/:id
 * @desc    Delete a license
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, isAdmin, licenseController.deleteLicense);

/**
 * @route   GET /api/licenses/alerts/expiring
 * @desc    Get licenses expiring soon
 * @access  Private (Viewer+)
 */
router.get('/alerts/expiring', verifyToken, isViewer, licenseController.getExpiringLicenses);

/**
 * @route   GET /api/licenses/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Viewer+)
 */
router.get('/dashboard/stats', verifyToken, isViewer, licenseController.getDashboardStats);

module.exports = router;
