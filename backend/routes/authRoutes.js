const express = require('express');
const router = express.Router();
const multer = require('multer');
const { register, login, fetchAllUsers, updatePassword, uploadBulkUsers, deleteUserHandler} = require('../controllers/authController.js');
const { authMiddleware, roleMiddleware } = require('../middleware/middleware');

//Upload files into memory as buffers.
const upload = multer({ storage: multer.memoryStorage() });

//Routes for user management
router.post('/register', authMiddleware, roleMiddleware('admin'), register);
router.post('/login', login);
router.get('/users', authMiddleware, fetchAllUsers);
router.post('/upload-users',upload.single('file'),authMiddleware,roleMiddleware('admin'),uploadBulkUsers);
router.put('/password/:userId',authMiddleware,updatePassword)
router.delete('/users/:userId', authMiddleware,roleMiddleware('admin'),deleteUserHandler);

module.exports = router;