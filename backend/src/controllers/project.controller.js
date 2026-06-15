const projectService = require('../services/project.service');

const projectController = {
  async list(req, res, next) {
    try {
      const result = await projectService.getAll(req.query, req.user);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const project = await projectService.getById(req.params.id, req.user);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const project = await projectService.create(req.body, req.user);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const project = await projectService.update(req.params.id, req.body, req.user);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await projectService.delete(req.params.id, req.user);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async dashboardStats(req, res, next) {
    try {
      const stats = await projectService.getDashboardStats(req.user);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = projectController;
