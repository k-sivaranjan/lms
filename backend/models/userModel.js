const  UserRepository  = require('../repositories/UserRepository');

const userRepository = new UserRepository();

const getAllUsers = async () => {
  return userRepository.getAllUsers();
};

const createUser = async (name, email, password, role, managerId) => {
  return userRepository.createUser(name, email, password, role, managerId);
};

const getUserByEmail = async (email) => {
  return userRepository.getUserByEmail(email);
};

const getUser = async (email) => {
  return userRepository.getUserByEmail(email);
};

const getUserById = async (id) => {
  return userRepository.getUserById(id);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUser,
  getUserById
};
