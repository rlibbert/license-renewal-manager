const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @returns {Promise} - Promise that resolves with the send info
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a license renewal notification
 * @param {Object} license - License information
 * @param {number} daysUntilExpiration - Days until the license expires
 */
const sendRenewalNotification = async (license, daysUntilExpiration) => {
  const subject = `License Renewal Reminder: ${license.software_name} expires in ${daysUntilExpiration} days`;
  
  const text = `
    Dear ${license.contact_name},
    
    This is a reminder that the license for ${license.software_name} from ${license.vendor} will expire in ${daysUntilExpiration} days on ${new Date(license.expiration_date).toLocaleDateString()}.
    
    License Details:
    - Software: ${license.software_name}
    - Vendor: ${license.vendor}
    - License Type: ${license.license_type}
    - Auto-Renewal: ${license.auto_renewal ? 'Yes' : 'No'}
    - Expiration Date: ${new Date(license.expiration_date).toLocaleDateString()}
    
    Please take appropriate action to ensure continuity of service.
    
    Regards,
    License Renewal Manager
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>License Renewal Reminder</h2>
      <p>Dear ${license.contact_name},</p>
      <p>This is a reminder that the license for <strong>${license.software_name}</strong> from <strong>${license.vendor}</strong> will expire in <strong>${daysUntilExpiration} days</strong> on <strong>${new Date(license.expiration_date).toLocaleDateString()}</strong>.</p>
      
      <h3>License Details:</h3>
      <ul>
        <li><strong>Software:</strong> ${license.software_name}</li>
        <li><strong>Vendor:</strong> ${license.vendor}</li>
        <li><strong>License Type:</strong> ${license.license_type}</li>
        <li><strong>Auto-Renewal:</strong> ${license.auto_renewal ? 'Yes' : 'No'}</li>
        <li><strong>Expiration Date:</strong> ${new Date(license.expiration_date).toLocaleDateString()}</li>
      </ul>
      
      <p>Please take appropriate action to ensure continuity of service.</p>
      
      <p>Regards,<br>License Renewal Manager</p>
    </div>
  `;
  
  return sendEmail({
    to: license.contact_email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendRenewalNotification,
};
