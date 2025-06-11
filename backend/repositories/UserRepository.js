const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const { Role } = require('../entities/Role');
const { LeaveType } = require('../entities/LeaveType');
const { LeaveBalance } = require('../entities/LeaveBalance');
const { LeaveRequest } = require('../entities/LeaveRequest');
const { LeaveApproval } = require('../entities/LeaveApproval');
const { Not,In } = require('typeorm');


const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);
const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);
const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

// Get all active users (excluding soft-deleted)
const getAllUsers = async () => {
  return userRepo.find({
    where: {
      role: { id: Not(1) },
      deletedAt: null,
    },
    relations: ['role'],
    order: { id: 'ASC' },
  });
};

// Create a new user and auto-generate leave balances
const createUser = async ({ name, email, password, roleId, managerId = null }) => {
  const role = await roleRepo.findOne({ where: { id: roleId, deletedAt: null } });
  if (!role) throw new Error('Invalid roleId');

  const user = userRepo.create({ name, email, password, role, managerId });
  const savedUser = await userRepo.save(user);

  // Automatically insert leave balances
  const leaveTypes = await leaveTypeRepo.find({ where: { deletedAt: null }});
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
  return userRepo.findOne({
    where: {
      email,
      deletedAt: null,
    },
    relations: ['role'],
  });
};

// Find user by id
const getUserById = async (id) => {
  return userRepo.findOne({
    where: {
      id,
      deletedAt: null,
    },
    relations: ['role'],
  });
};

// Update password
const updatePasswordById = async (userId, password) => {
  const user = await userRepo.findOneBy({ id: userId });
  if (!user || user.deletedAt) throw new Error("User not found or has been deleted.");
  user.password = password;
  await userRepo.save(user);
};

// Soft delete a user and their leave balances
const softDeleteUserById = async (userId) => {
  const leaveRequests = await leaveRequestRepo.find({
    where: { user: { id: userId } },
    select: ['id']
  });

  const leaveRequestIds = leaveRequests.map(lr => lr.id);
  if (leaveRequestIds.length > 0) {
    await leaveApprovalRepo.softDelete({ leaveRequestId: In(leaveRequestIds) });
  }

  await leaveBalanceRepo.softDelete({ user: { id: userId } });
  await leaveRequestRepo.softDelete({ user: { id: userId } });
  await userRepo.softDelete(userId);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
  updatePasswordById,
  softDeleteUserById,
}