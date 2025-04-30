const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const roleMiddleware = (requiredRole) => (req, res, next) => {
  const { role } = req.user;

  if (role !== requiredRole) {
    return res.status(403).json({ message: 'Access denied. You do not have the access rights to perform this action.' });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };
