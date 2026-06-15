const express = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { requireOrganization } = require('../middlewares/tenant.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  userCreateValidator,
  userUpdateValidator,
  idParamValidator,
} = require('../validators');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'org_admin'), userController.list);
router.get('/:id', idParamValidator, validate, authorize('super_admin', 'org_admin'), userController.getById);
router.post(
  '/',
  authorize('super_admin', 'org_admin'),
  requireOrganization,
  userCreateValidator,
  validate,
  userController.create
);
router.put(
  '/:id',
  userUpdateValidator,
  validate,
  authorize('super_admin', 'org_admin'),
  userController.update
);
router.delete(
  '/:id',
  idParamValidator,
  validate,
  authorize('super_admin', 'org_admin'),
  userController.remove
);

module.exports = router;
