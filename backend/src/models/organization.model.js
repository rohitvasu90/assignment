const pool = require('../config/database');

const organizationModel = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, name, status, created_at, updated_at FROM organizations ORDER BY created_at DESC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, status, created_at, updated_at FROM organizations WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, status = 'active' }) {
    const [result] = await pool.query(
      'INSERT INTO organizations (name, status) VALUES (?, ?)',
      [name, status]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, status }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM organizations WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = organizationModel;
