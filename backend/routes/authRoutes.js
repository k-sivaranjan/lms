const express = require('express');
const router = express.Router();
const { register, login, fetchAllUsers } = require('../controllers/authController.js');
const { authMiddleware, roleMiddleware } = require('../middleware/middleware');

router.post('/register', authMiddleware, roleMiddleware('admin'), register);
router.post('/login', login);
router.get('/users', authMiddleware, fetchAllUsers);

module.exports = router;
