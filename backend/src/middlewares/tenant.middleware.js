const AppError = require('../utils/AppError');

const tenantGuard = (req, res, next) => {
  req.ensureSameOrganization = (resourceOrganizationId) => {
    if (req.user.role === 'super_admin') {
      return;
    }

    if (Number(resourceOrganizationId) !== Number(req.user.organizationId)) {
      throw new AppError('Access denied: cross-organization access forbidden', 403);
    }
  };

  next();
};

const requireOrganization = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }

  if (!req.user.organizationId) {
    return next(new AppError('User is not associated with an organization', 403));
  }

  next();
};

module.exports = { tenantGuard, requireOrganization };
