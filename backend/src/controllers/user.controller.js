const userService = require('../services/user.service');

const userController = {
  async list(req, res, next) {
    try {
      const users = await userService.getAll(req.user);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id, req.user);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body, req.user);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body, req.user);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await userService.delete(req.params.id, req.user);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
