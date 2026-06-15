const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'organization_portal',
  });

  console.log('Seeding database...');

  const superAdminEmail = 'superadmin@example.com';
  const [existingSuperAdmin] = await connection.query(
    'SELECT id FROM users WHERE email = ?',
    [superAdminEmail]
  );

  if (existingSuperAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    await connection.query(
      `INSERT INTO users (organization_id, name, email, password, role, status)
       VALUES (NULL, 'Super Admin', ?, ?, 'super_admin', 'active')`,
      [superAdminEmail, hashedPassword]
    );
    console.log('Created super admin');
  } else {
    console.log('Super admin already exists, skipping');
  }

  let orgId;
  const [existingOrg] = await connection.query(
    'SELECT id FROM organizations WHERE name = ?',
    ['Demo Organization']
  );

  if (existingOrg.length === 0) {
    const [orgResult] = await connection.query(
      "INSERT INTO organizations (name, status) VALUES ('Demo Organization', 'active')"
    );
    orgId = orgResult.insertId;
    console.log('Created demo organization');
  } else {
    orgId = existingOrg[0].id;
    console.log('Demo organization already exists, skipping');
  }

  const orgAdminEmail = 'admin@demo.com';
  let orgAdminId;
  const [existingOrgAdmin] = await connection.query(
    'SELECT id FROM users WHERE email = ?',
    [orgAdminEmail]
  );

  if (existingOrgAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const [adminResult] = await connection.query(
      `INSERT INTO users (organization_id, name, email, password, role, status)
       VALUES (?, 'Org Admin', ?, ?, 'org_admin', 'active')`,
      [orgId, orgAdminEmail, hashedPassword]
    );
    orgAdminId = adminResult.insertId;
    console.log('Created organization admin');
  } else {
    orgAdminId = existingOrgAdmin[0].id;
    console.log('Organization admin already exists, skipping');
  }

  const demoUserEmail = 'user@demo.com';
  let demoUserId;
  const [existingDemoUser] = await connection.query(
    'SELECT id FROM users WHERE email = ?',
    [demoUserEmail]
  );

  if (existingDemoUser.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const [userResult] = await connection.query(
      `INSERT INTO users (organization_id, name, email, password, role, status)
       VALUES (?, 'Demo User', ?, ?, 'user', 'active')`,
      [orgId, demoUserEmail, hashedPassword]
    );
    demoUserId = userResult.insertId;
    console.log('Created demo user');
  } else {
    demoUserId = existingDemoUser[0].id;
    console.log('Demo user already exists, skipping');
  }

  const [projectCount] = await connection.query(
    'SELECT COUNT(*) AS count FROM projects WHERE organization_id = ?',
    [orgId]
  );

  if (projectCount[0].count < 5) {
    const projects = [
      { name: 'CRM System', description: 'Internal CRM for sales team', status: 'in_progress' },
      { name: 'Mobile App', description: 'Customer-facing mobile application', status: 'pending' },
      { name: 'Analytics Dashboard', description: 'Real-time business analytics', status: 'completed' },
      { name: 'HR Portal', description: 'Employee self-service portal', status: 'in_progress' },
      { name: 'Inventory Manager', description: 'Warehouse inventory tracking system', status: 'pending' },
    ];

    for (const project of projects) {
      await connection.query(
        `INSERT INTO projects (organization_id, owner_id, name, description, status)
         VALUES (?, ?, ?, ?, ?)`,
        [orgId, orgAdminId, project.name, project.description, project.status]
      );
    }
    console.log('Created 5 demo projects');
  } else {
    console.log('Demo projects already exist, skipping');
  }

  await connection.end();
  console.log('Seeding completed successfully.');
  console.log('\nDefault credentials:');
  console.log('  Super Admin: superadmin@example.com / password123');
  console.log('  Org Admin:   admin@demo.com / password123');
  console.log('  User:        user@demo.com / password123');
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
