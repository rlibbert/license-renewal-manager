require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  console.log('Seeding database with initial data...');
  
  try {
    // Seed default users
    const adminExists = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (adminExists.rows.length === 0) {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@example.com', adminPassword, 'admin']
      );
      console.log('Admin user created');
      
      // Create editor user
      const editorPassword = await bcrypt.hash('editor123', 10);
      await db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['editor', 'editor@example.com', editorPassword, 'editor']
      );
      console.log('Editor user created');
      
      // Create viewer user
      const viewerPassword = await bcrypt.hash('viewer123', 10);
      await db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['viewer', 'viewer@example.com', viewerPassword, 'viewer']
      );
      console.log('Viewer user created');
    } else {
      console.log('Default users already exist, skipping user creation');
    }
    
    // Seed sample licenses if none exist
    const licensesExist = await db.query('SELECT * FROM licenses LIMIT 1');
    
    if (licensesExist.rows.length === 0) {
      // Get admin user id
      const adminUser = await db.query('SELECT id FROM users WHERE username = ?', ['admin']);
      const adminId = adminUser.rows[0].id;
      
      // Sample licenses data
      const sampleLicenses = [
        {
          software_name: 'Microsoft Office 365',
          vendor: 'Microsoft',
          license_type: 'Subscription',
          purchase_date: '2023-01-15',
          expiration_date: '2024-01-15',
          auto_renewal: 1,
          contact_name: 'John Smith',
          contact_email: 'john.smith@example.com',
          license_key: 'XXXX-XXXX-XXXX-XXXX-1234',
          notes: 'Enterprise agreement for 100 users'
        },
        {
          software_name: 'Adobe Creative Cloud',
          vendor: 'Adobe',
          license_type: 'Subscription',
          purchase_date: '2023-02-10',
          expiration_date: '2024-02-10',
          auto_renewal: 1,
          contact_name: 'Jane Doe',
          contact_email: 'jane.doe@example.com',
          license_key: 'ABCD-EFGH-IJKL-MNOP-5678',
          notes: 'Design team license'
        },
        {
          software_name: 'Windows Server 2022',
          vendor: 'Microsoft',
          license_type: 'Perpetual',
          purchase_date: '2023-03-05',
          expiration_date: '2026-03-05',
          auto_renewal: 0,
          contact_name: 'Robert Johnson',
          contact_email: 'robert.johnson@example.com',
          license_key: 'SRVR-XXXX-XXXX-XXXX-9012',
          notes: 'Data center license with 3-year support'
        },
        {
          software_name: 'Oracle Database',
          vendor: 'Oracle',
          license_type: 'Per User',
          purchase_date: '2023-01-20',
          expiration_date: '2023-07-20',
          auto_renewal: 0,
          contact_name: 'Sarah Williams',
          contact_email: 'sarah.williams@example.com',
          license_key: 'ORCL-XXXX-XXXX-XXXX-3456',
          notes: 'Development environment license'
        },
        {
          software_name: 'VMware vSphere',
          vendor: 'VMware',
          license_type: 'Per Device',
          purchase_date: '2022-11-15',
          expiration_date: '2023-11-15',
          auto_renewal: 1,
          contact_name: 'Michael Brown',
          contact_email: 'michael.brown@example.com',
          license_key: 'VMWR-XXXX-XXXX-XXXX-7890',
          notes: 'Production environment virtualization'
        }
      ];
      
      // Insert sample licenses
      for (const license of sampleLicenses) {
        await db.run(
          `INSERT INTO licenses 
           (software_name, vendor, license_type, purchase_date, expiration_date, 
            auto_renewal, contact_name, contact_email, license_key, notes, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            license.software_name,
            license.vendor,
            license.license_type,
            license.purchase_date,
            license.expiration_date,
            license.auto_renewal,
            license.contact_name,
            license.contact_email,
            license.license_key,
            license.notes,
            adminId
          ]
        );
      }
      
      console.log('Sample licenses created');
    } else {
      console.log('Licenses already exist, skipping license creation');
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeds
seedDatabase();
