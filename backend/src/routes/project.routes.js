const express = require('express');
const projectController = require('../controllers/project.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { requireOrganization, tenantGuard } = require('../middlewares/tenant.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  projectCreateValidator,
  projectUpdateValidator,
  projectListValidator,
  idParamValidator,
} = require('../validators');

const router = express.Router();

router.use(authenticate, tenantGuard);

router.get('/dashboard/stats', projectController.dashboardStats);
router.get('/', projectListValidator, validate, projectController.list);
router.get('/:id', idParamValidator, validate, projectController.getById);
router.post(
  '/',
  authorize('org_admin', 'user'),
  requireOrganization,
  projectCreateValidator,
  validate,
  projectController.create
);
router.put(
  '/:id',
  authorize('org_admin', 'user'),
  projectUpdateValidator,
  validate,
  projectController.update
);
router.delete(
  '/:id',
  authorize('org_admin', 'user'),
  idParamValidator,
  validate,
  projectController.remove
);

module.exports = router;
