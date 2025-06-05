const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const { Role } = require('../entities/Role');
const { LeaveType } = require('../entities/LeaveType');
const { LeaveBalance } = require('../entities/LeaveBalance');
const { Not } = require('typeorm');

const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);
const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

// Get all users including their roles
const getAllUsers = async () => userRepo.find({ where: { role: { id: Not(1) } }, relations: ['role'], order: { id: 'ASC' } });

// Create user
const createUser = async ({name, email, password, roleId, managerId = null}) => {
  const role = await roleRepo.findOne({ where: { id: roleId } });
  if (!role) throw new Error('Invalid roleId');

  const user = userRepo.create({ name, email, password, role, managerId });
  const savedUser = await userRepo.save(user);

  // Automatically insert leave balances for all leave types
  const leaveTypes = await leaveTypeRepo.find();
  const currentYear = new Date().getFullYear();
  
  const leaveBalances = leaveTypes.map((lt) =>
    leaveBalanceRepo.create({
      userId: savedUser.id,
      leaveTypeId: lt.id,
      year: currentYear,
      balance: lt.maxPerYear,
      used: 0,
    })
  );

  await leaveBalanceRepo.save(leaveBalances);

  return savedUser;
};

// Find user by email
const getUserByEmail = async (email) => {
  return userRepo.findOne({ where: { email }, relations: ['role'] });
};

// Find user by id
const getUserById = async (id) => {
  return userRepo.findOne({ where: { id }, relations: ['role'] });
};

// Update Password
const updatePasswordById = async (userId, password) => {
  const user = await userRepo.findOneBy({ id: userId });
  user.password = password;
  await userRepo.save(user);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
  updatePasswordById,
};