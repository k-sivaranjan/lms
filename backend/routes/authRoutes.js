const express = require('express');
const { register, login, fetchAllUsers } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.get('/users', fetchAllUsers);
router.post('/add-user', register);

module.exports = router;