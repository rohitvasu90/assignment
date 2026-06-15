const organizationService = require('../services/organization.service');

const organizationController = {
  async list(req, res, next) {
    try {
      const organizations = await organizationService.getAll();
      res.json({ success: true, data: organizations });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const organization = await organizationService.getById(req.params.id);
      res.json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const organization = await organizationService.create(req.body);
      res.status(201).json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const organization = await organizationService.update(req.params.id, req.body);
      res.json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await organizationService.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = organizationController;
