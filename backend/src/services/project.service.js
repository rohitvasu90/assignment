const projectModel = require('../models/project.model');
const userModel = require('../models/user.model');
const AppError = require('../utils/AppError');

const projectService = {
  async getAll(query, currentUser) {
    const options = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      search: query.search || '',
      status: query.status,
      sort: query.sort || 'created_at',
      order: query.order || 'desc',
    };

    if (currentUser.role === 'super_admin') {
      return projectModel.findAll(options);
    }

    return projectModel.findAllByOrganization(currentUser.organizationId, options);
  },

  async getById(id, currentUser) {
    const project = await projectModel.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (currentUser.role !== 'super_admin') {
      if (Number(project.organization_id) !== Number(currentUser.organizationId)) {
        throw new AppError('Access denied: cross-organization access forbidden', 403);
      }
    }

    return project;
  },

  async create(data, currentUser) {
    if (currentUser.role === 'super_admin') {
      throw new AppError('Super admin cannot create projects directly', 403);
    }

    if (!currentUser.organizationId) {
      throw new AppError('User is not associated with an organization', 403);
    }

    return projectModel.create({
      organizationId: currentUser.organizationId,
      ownerId: currentUser.id,
      name: data.name,
      description: data.description || null,
      status: data.status || 'pending',
    });
  },

  async update(id, data, currentUser) {
    await this.getById(id, currentUser);
    return projectModel.update(id, data);
  },

  async delete(id, currentUser) {
    await this.getById(id, currentUser);
    const deleted = await projectModel.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete project', 500);
    }
    return { message: 'Project deleted successfully' };
  },

  async getDashboardStats(currentUser) {
    if (currentUser.role === 'super_admin') {
      const orgCount = (await require('../models/organization.model').findAll()).length;
      const users = await userModel.findAll();
      const projects = await projectModel.findAll({ limit: 1000 });

      return {
        organizations: orgCount,
        users: users.length,
        projects: projects.pagination.total,
        recentProjects: projects.data.slice(0, 5),
        statusBreakdown: {},
      };
    }

    const organizationId = currentUser.organizationId;
    const [userCount, projectCount, statusBreakdown, recentProjects] = await Promise.all([
      userModel.countByOrganization(organizationId),
      projectModel.countByOrganization(organizationId),
      projectModel.countByStatus(organizationId),
      projectModel.findRecentByOrganization(organizationId, 5),
    ]);

    const breakdown = statusBreakdown.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    return {
      users: userCount,
      projects: projectCount,
      statusBreakdown: breakdown,
      recentProjects,
    };
  },
};

module.exports = projectService;
