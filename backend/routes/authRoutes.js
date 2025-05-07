const express = require('express');
const router = express.Router();
const { register, login, fetchAllUsers } = require('../controllers/authController.js');
const { authMiddleware, roleMiddleware } = require('../middleware/middleware');

// Routes for user management
router.post('/register', authMiddleware, roleMiddleware('admin'), register);
router.post('/login', login);
router.get('/users', authMiddleware, fetchAllUsers);

module.exports = router;