const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is a company token
    if (decoded.type === 'company') {
      const Company = require('../models/Company');
      console.log('Looking for company with ID:', decoded.id);
      req.user = await Company.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('Company not found in database for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Company not found'
        });
      }
      
      console.log('Company found:', req.user.companyName);
      console.log('Company ID:', req.user._id);
      console.log('Company Email:', req.user.companyEmail);
      console.log('Account Status:', req.user.accountStatus);

      // Check if company account is active
      if (req.user.accountStatus === 'suspended' || req.user.accountStatus === 'inactive') {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Set role for authorization middleware
      req.user.role = 'company';
    } else {
      // Regular user token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check - User role:', req.user?.role, 'Required roles:', roles);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
