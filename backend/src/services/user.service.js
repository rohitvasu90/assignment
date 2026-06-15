const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password');
const AppError = require('../utils/AppError');

const userService = {
  async getAll(currentUser) {
    if (currentUser.role === 'super_admin') {
      return userModel.findAll();
    }

    return userModel.findAllByOrganization(currentUser.organizationId);
  },

  async getById(id, currentUser) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (currentUser.role !== 'super_admin') {
      if (Number(user.organization_id) !== Number(currentUser.organizationId)) {
        throw new AppError('Access denied: cross-organization access forbidden', 403);
      }
    }

    return user;
  },

  async create(data, currentUser) {
    const organizationId =
      currentUser.role === 'super_admin' ? data.organizationId : currentUser.organizationId;

    if (!organizationId) {
      throw new AppError('Organization ID is required', 400);
    }

    const existing = await userModel.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await hashPassword(data.password);
    const role = data.role || 'user';

    if (currentUser.role === 'org_admin' && role === 'super_admin') {
      throw new AppError('Cannot assign super_admin role', 403);
    }

    return userModel.create({
      organizationId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role,
      status: data.status || 'active',
    });
  },

  async update(id, data, currentUser) {
    const user = await this.getById(id, currentUser);

    if (currentUser.role === 'org_admin') {
      if (user.role === 'super_admin') {
        throw new AppError('Cannot modify super admin users', 403);
      }
      if (data.role === 'super_admin') {
        throw new AppError('Cannot assign super_admin role', 403);
      }
    }

    if (data.email && data.email !== user.email) {
      const existing = await userModel.findByEmail(data.email);
      if (existing) {
        throw new AppError('Email already in use', 409);
      }
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    return userModel.update(id, updateData);
  },

  async delete(id, currentUser) {
    const user = await this.getById(id, currentUser);

    if (user.id === currentUser.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    if (currentUser.role === 'org_admin' && user.role === 'super_admin') {
      throw new AppError('Cannot delete super admin users', 403);
    }

    const deleted = await userModel.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete user', 500);
    }

    return { message: 'User deleted successfully' };
  },
};

module.exports = userService;
