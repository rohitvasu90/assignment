const pool = require('../config/database');

const ALLOWED_SORT_FIELDS = ['name', 'status', 'created_at', 'updated_at'];
const ALLOWED_ORDER = ['asc', 'desc'];

const projectModel = {
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.id, p.organization_id, p.owner_id, p.name, p.description, p.status,
              p.created_at, p.updated_at, u.name AS owner_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.owner_id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findAllByOrganization(organizationId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sort = 'created_at',
      order = 'desc',
    } = options;

    const safeSort = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'created_at';
    const safeOrder = ALLOWED_ORDER.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.organization_id = ?';
    const params = [organizationId];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM projects p ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT p.id, p.organization_id, p.owner_id, p.name, p.description, p.status,
             p.created_at, p.updated_at, u.name AS owner_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      ${whereClause}
      ORDER BY p.${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sort = 'created_at',
      order = 'desc',
    } = options;

    const safeSort = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'created_at';
    const safeOrder = ALLOWED_ORDER.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM projects p ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT p.id, p.organization_id, p.owner_id, p.name, p.description, p.status,
             p.created_at, p.updated_at, u.name AS owner_name, o.name AS organization_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      LEFT JOIN organizations o ON o.id = p.organization_id
      ${whereClause}
      ORDER BY p.${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async create({ organizationId, ownerId, name, description, status = 'pending' }) {
    const [result] = await pool.query(
      `INSERT INTO projects (organization_id, owner_id, name, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [organizationId, ownerId, name, description, status]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, description, status }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async countByOrganization(organizationId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM projects WHERE organization_id = ?',
      [organizationId]
    );
    return rows[0].count;
  },

  async countByStatus(organizationId) {
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM projects
       WHERE organization_id = ? GROUP BY status`,
      [organizationId]
    );
    return rows;
  },

  async findRecentByOrganization(organizationId, limit = 5) {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.status, p.created_at, u.name AS owner_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.owner_id
       WHERE p.organization_id = ?
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [organizationId, limit]
    );
    return rows;
  },
};

module.exports = projectModel;
