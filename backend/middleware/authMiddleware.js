const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in to access this resource.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = {
      id: user.id || user._id,
      name: user.name,
      email: user.email
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired. Please log in again.'
    });
  }
}

module.exports = {
  protect
};
