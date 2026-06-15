const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/user.model');
const AppError = require('../utils/AppError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await userModel.findById(decoded.id);
    if (!user || user.status !== 'active') {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
