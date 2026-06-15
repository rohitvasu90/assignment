const express = require('express');
const organizationController = require('../controllers/organization.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  organizationCreateValidator,
  organizationUpdateValidator,
  idParamValidator,
} = require('../validators');

const router = express.Router();

router.use(authenticate, authorize('super_admin'));

router.get('/', organizationController.list);
router.get('/:id', idParamValidator, validate, organizationController.getById);
router.post('/', organizationCreateValidator, validate, organizationController.create);
router.put('/:id', organizationUpdateValidator, validate, organizationController.update);
router.delete('/:id', idParamValidator, validate, organizationController.remove);

module.exports = router;
