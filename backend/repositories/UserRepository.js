const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');

const userRepo = AppDataSource.getRepository(User);

// Get all users from the database
const getAllUsers = async () => userRepo.find();

// Create a new user in the database
const createUser = async (name, email, password, role, managerId = null) => {
  const user = userRepo.create({ name, email, password, role, managerId });
  return userRepo.save(user);
};

// Find a user by their email address
const getUserByEmail = async (email) => userRepo.findOne({ where: { email } });

// Find a user by their ID
const getUserById = async (id) => userRepo.findOne({ where: { id } });

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
};
