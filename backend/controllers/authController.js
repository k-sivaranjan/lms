const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const parseExcelToJson = require('../utils/excelParser');
const Queue = require('bull');
const { getAllUsers, createUser, getUserByEmail, updatePasswordByid,deleteUser } = require('../models/userModel.js');

// const {User} = require("../entities/User")
// const {LeaveBalance} = require("../entities/LeaveBalance")
// const {AppDataSource} = require("../config/db")

// const userRepo = AppDataSource.getRepository(User)
// const balanceRepo = AppDataSource.getRepository(LeaveBalance)

// const {MoreThan} = require("typeorm")

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

const roleEnum = {
  admin: 1,
  hr: 2,
  manager: 3,
  employee: 4,
};

// Register new user
const register = async (req, res) => {
  try {
    let { name, email, password, role, reportingManagerId } = req.body;

    const roleId = roleEnum[role.toLowerCase()];
    if (!roleId) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({ name, email, password: hashedPassword, roleId, managerId: reportingManagerId });
    res.status(201).json({ success: true, message: 'User added successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Login an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

    // await balanceRepo.delete({ userId: MoreThan(6) });
    // await userRepo.delete({ id: MoreThan(6) });

    res.status(200).json({ success: true, message: 'Login successful', data: { user, token } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await updatePasswordByid(userId, hashedPassword);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

// Fetch all users
const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found.' });
    }

    res.status(200).json({ success: true, message: 'Users fetched successfully', data: { count: users.length, users } });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Bulk Upload Many Users Via Excel Sheet
const userQueue = new Queue('userQueue', {
  redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST,password:process.env.REDIS_PASSWORD } 
});

// Helper function to chunk array into smaller arrays
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const CHUNK_SIZE = 100;

const uploadBulkUsers = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const users = parseExcelToJson(file.buffer);
    const userChunks = chunkArray(users, CHUNK_SIZE);

    for (const chunk of userChunks) {
      await userQueue.add({ users: chunk });
    }
    res.status(200).json({ success: true, message: 'Worker started processing...' });
  } catch (error) {
    console.error('Upload bulk users error:', error);
    res.status(500).json({ success: false, message: 'Failed to process Excel file' });
  }
};

//Delete User
const deleteUserHandler = async(req,res)=>{
  try {
    const userId = parseInt(req.params.userId);
    const result = await deleteUser(userId);
    res.status(200).json({ success: true, message: 'User deleted successfully', result });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
}

module.exports = {
  register,
  login,
  fetchAllUsers,
  updatePassword,
  uploadBulkUsers,
  deleteUserHandler
};