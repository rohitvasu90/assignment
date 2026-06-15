const pool = require('../config/database');

const userModel = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT id, organization_id, name, email, password, role, status, created_at, updated_at
       FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, organization_id, name, email, role, status, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findAllByOrganization(organizationId) {
    const [rows] = await pool.query(
      `SELECT id, organization_id, name, email, role, status, created_at, updated_at
       FROM users WHERE organization_id = ? ORDER BY created_at DESC`,
      [organizationId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT u.id, u.organization_id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at,
              o.name AS organization_name
       FROM users u
       LEFT JOIN organizations o ON o.id = u.organization_id
       ORDER BY u.created_at DESC`
    );
    return rows;
  },

  async create({ organizationId, name, email, password, role, status = 'active' }) {
    const [result] = await pool.query(
      `INSERT INTO users (organization_id, name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [organizationId, name, email, password, role, status]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, email, password, role, status }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (password !== undefined) {
      fields.push('password = ?');
      values.push(password);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async countByOrganization(organizationId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM users WHERE organization_id = ?',
      [organizationId]
    );
    return rows[0].count;
  },
};

module.exports = userModel;
