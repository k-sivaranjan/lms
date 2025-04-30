const express = require('express');
const { register, login, fetchAllUsers } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/middleware'); 
const router = express.Router();

router.post('/login', login);
router.get('/users', authMiddleware, roleMiddleware('admin'), fetchAllUsers);
router.post('/add-user', authMiddleware, roleMiddleware('admin'), register);

module.exports = router;