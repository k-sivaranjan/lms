const {
  getAllUsers: repoGetAllUsers,
  createUser: repoCreateUser,
  getUserByEmail: repoGetUserByEmail,
  getUserById: repoGetUserById
} = require('../repositories/UserRepository');

const getAllUsers = async () => {
  return repoGetAllUsers();
};

const createUser = async (name, email, password, role, managerId) => {
  return repoCreateUser(name, email, password, role, managerId);
};

const getUserByEmail = async (email) => {
  return repoGetUserByEmail(email);
};

const getUser = async (email) => {
  return getUserByEmail(email);
};

const getUserById = async (id) => {
  return repoGetUserById(id);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUser,
  getUserById
};