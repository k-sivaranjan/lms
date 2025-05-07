const {
  getAllUsers: repoGetAllUsers,
  createUser: repoCreateUser,
  getUserByEmail: repoGetUserByEmail,
  getUserById: repoGetUserById
} = require('../repositories/UserRepository');

// Get all users from the database
const getAllUsers = async () => {
  return repoGetAllUsers();
};

// Create a new user in the database
const createUser = async (name, email, password, role, managerId) => {
  return repoCreateUser(name, email, password, role, managerId);
};

// Get a user by their email address
const getUserByEmail = async (email) => {
  return repoGetUserByEmail(email);
};

// Get a user by their ID
const getUserById = async (id) => {
  return repoGetUserById(id);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById
};