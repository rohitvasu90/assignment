const { body, param, query } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const organizationCreateValidator = [
  body('name').trim().notEmpty().withMessage('Organization name is required'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
];

const organizationUpdateValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid organization ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Organization name cannot be empty'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
];

const userCreateValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('organizationId').optional().isInt({ min: 1 }).withMessage('Valid organization ID is required'),
  body('role').optional().isIn(['org_admin', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
];

const userUpdateValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['org_admin', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
];

const projectCreateValidator = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
];

const projectUpdateValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
];

const projectListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional({ values: 'falsy' })
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Invalid status'),
  query('sort').optional().isIn(['name', 'status', 'created_at', 'updated_at']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required'),
];

module.exports = {
  loginValidator,
  organizationCreateValidator,
  organizationUpdateValidator,
  userCreateValidator,
  userUpdateValidator,
  projectCreateValidator,
  projectUpdateValidator,
  projectListValidator,
  idParamValidator,
};
