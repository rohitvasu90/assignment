const userModel = require('../models/user.model');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const authService = {
  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Account is inactive', 403);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      organizationId: user.organization_id,
    });

    const { password: _, ...safeUser } = user;

    return {
      token,
      user: {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        organizationId: safeUser.organization_id,
        status: safeUser.status,
      },
    };
  },

  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },
};

module.exports = authService;
