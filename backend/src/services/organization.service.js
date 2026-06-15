const organizationModel = require('../models/organization.model');
const AppError = require('../utils/AppError');

const organizationService = {
  async getAll() {
    return organizationModel.findAll();
  },

  async getById(id) {
    const org = await organizationModel.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }
    return org;
  },

  async create(data) {
    return organizationModel.create(data);
  },

  async update(id, data) {
    await this.getById(id);
    return organizationModel.update(id, data);
  },

  async delete(id) {
    await this.getById(id);
    const deleted = await organizationModel.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete organization', 500);
    }
    return { message: 'Organization deleted successfully' };
  },
};

module.exports = organizationService;
