const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');

const userRepo = AppDataSource.getRepository(User);

const getAllUsers = async () => userRepo.find();

const createUser = async (name, email, password, role, managerId = null) => {
  const user = userRepo.create({ name, email, password, role, managerId });
  return userRepo.save(user);
};

const getUserByEmail = async (email) => userRepo.findOne({ where: { email } });

const getUserById = async (id) => userRepo.findOne({ where: { id } });

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
};
