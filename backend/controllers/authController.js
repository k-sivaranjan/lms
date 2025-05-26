const jwt  = require('jsonwebtoken');
const dotenv= require ('dotenv');
const parseExcelToJson = require('../utils/excelParser');
const Queue = require('bull');
const { getAllUsers, createUser, getUserByEmail, updatePasswordByid } = require ('../models/userModel.js'); 

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, reportingManagerId } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    await createUser(name, email, password, role, reportingManagerId);
    res.status(201).json({ message: 'User Added successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { password } = req.body;

  try {
    const updateNewPassword = await updatePasswordByid(userId, password);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};


// Fetch all users
const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }

    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

//Bulk Upload Many Users Via Excel Sheet
const userQueue = new Queue('userQueue', { redis: { port: 6379, host: '127.0.0.1' } });

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
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const users = parseExcelToJson(file.buffer);
    const userChunks = chunkArray(users, CHUNK_SIZE);
    
    for (const chunk of userChunks) {
      await userQueue.add({ users: chunk });
    }
    res.status(200).json({ message: 'Users Added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
};

module.exports = {
  register,
  login,
  fetchAllUsers,
  updatePassword,
  uploadBulkUsers
}