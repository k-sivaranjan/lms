const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const { LeaveType } = require('../entities/LeaveType');
const {LeaveBalance} =  require('../entities/LeaveBalance')
const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

const userRepo = AppDataSource.getRepository(User);

// Get all users from the database
const getAllUsers = async () => userRepo.find();

// Create a new user in the database
const createUser = async (name, email, password, role, managerId = null) => {
  const user = userRepo.create({ name, email, password, role, managerId });
  const savedUser = await userRepo.save(user);

  // Automatically insert leave balances for all leave types
  const leaveTypes = await leaveTypeRepo.find();

  const currentYear = new Date().getFullYear();
  const leaveBalances = leaveTypes.map((lt) => {
    return leaveBalanceRepo.create({
      userId: savedUser.id,
      leaveTypeId: lt.id,
      year: currentYear,
      balance: lt.maxPerYear,
      used: 0
    });
  });

  await leaveBalanceRepo.save(leaveBalances);

  return savedUser;
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
