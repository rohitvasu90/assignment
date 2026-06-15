const mysql = require('mysql2/promise');
require('dotenv').config();

const migrations = [
  {
    name: '001_create_organizations',
    up: `
      CREATE TABLE IF NOT EXISTS organizations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_organizations_status (status),
        INDEX idx_organizations_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: '002_create_users',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        organization_id BIGINT UNSIGNED NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'org_admin', 'user') NOT NULL DEFAULT 'user',
        status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_organization_id (organization_id),
        INDEX idx_users_role (role),
        INDEX idx_users_status (status),
        CONSTRAINT fk_users_organization
          FOREIGN KEY (organization_id) REFERENCES organizations(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: '003_create_projects',
    up: `
      CREATE TABLE IF NOT EXISTS projects (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        organization_id BIGINT UNSIGNED NOT NULL,
        owner_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_projects_organization_id (organization_id),
        INDEX idx_projects_owner_id (owner_id),
        INDEX idx_projects_status (status),
        INDEX idx_projects_name (name),
        CONSTRAINT fk_projects_organization
          FOREIGN KEY (organization_id) REFERENCES organizations(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_projects_owner
          FOREIGN KEY (owner_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: '004_create_migrations_table',
    up: `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
];

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || 'organization_portal';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [executed] = await connection.query('SELECT name FROM migrations');
  const executedNames = new Set(executed.map((row) => row.name));

  for (const migration of migrations) {
    if (migration.name === '004_create_migrations_table') continue;
    if (executedNames.has(migration.name)) {
      console.log(`Skipping: ${migration.name}`);
      continue;
    }

    console.log(`Running: ${migration.name}`);
    await connection.query(migration.up);
    await connection.query('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
  }

  await connection.end();
  console.log('Migrations completed successfully.');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
