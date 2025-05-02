const express = require('express');
const router = express.Router();
const { register, login, fetchAllUsers } = require('../controllers/authController.js');

router.post('/register', register);
router.post('/login', login);
router.get('/users', fetchAllUsers);

module.exports = router;