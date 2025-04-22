const { getAllUsers, createUser, getUserByEmail } = require('../models/userModel');

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
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }

    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports = { register, login, fetchAllUsers };