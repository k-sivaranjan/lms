const { AppDataSource } = require('../config/db');
const { LeaveBalance } = require('../entities/LeaveBalance');
const { User } = require("../entities/User")
const { In } = require('typeorm');

const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
const userRepo = AppDataSource.getRepository(User)

// Get all leave balances by allowed type
const getLeaveBalancesByAllowedTypes = async ({ userId, year, allowedLeaveTypeIds }) => {
  return leaveBalanceRepo.find({
    where: {
      userId,
      year,
      leaveTypeId: In(allowedLeaveTypeIds),
      deletedAt: null
    },
    relations: ['leaveType'],
  });
};

// Get all leave balances for a user in a specific year
const getLeaveBalanceByUserAndYear = async (userId, year) => {
  return leaveBalanceRepo.find({
    where: { userId, year, deletedAt: null },
    relations: ['leaveType'],
  });
};

// Update the balance and used fields of a leave balance record by ID
const updateLeaveBalance = async (id, balance, used) => {
  const leaveBalance = await leaveBalanceRepo.findOne({ where: { id } });
  if (!leaveBalance) return null;

  leaveBalance.balance = Number(balance);
  leaveBalance.used = Number(used);

  return leaveBalanceRepo.save(leaveBalance);
};

// Update the balance and used fields by user ID, leave type ID, and year
const updateLeaveBalanceByUserAndType = async ({ userId, leaveTypeId, year, balanceChange, usedChange }) => {
  const leaveBalance = await leaveBalanceRepo.findOne({
    where: { userId, leaveTypeId, year },
  });

  if (!leaveBalance) return null;

  if (balanceChange !== null) {
    leaveBalance.balance += Number(balanceChange);
  }

  leaveBalance.used += Number(usedChange);

  return leaveBalanceRepo.save(leaveBalance);
};

// Create a new leave balance record with specified values
const createLeaveBalance = async ({ leaveTypeId, balance, used = 0 }) => {
  const year = new Date().getFullYear();
  const users = await userRepo.find();

  if (!users.length) return { inserted: 0, message: "No users found." };
  console.log(users);

  const leaveBalances = users.map(user => ({
    user: { id: user.id },
    leaveType: { id: leaveTypeId },
    year,
    balance,
    used,
  }));
  console.log(leaveBalances);

  await leaveBalanceRepo.save(leaveBalances);
};

// Soft delete a leave balance by ID
const softDeleteLeaveBalance = async (id) => {
  const result = await leaveBalanceRepo.softDelete({ leaveType: { id } });
  return result.affected !== 0;
};

module.exports = {
  getLeaveBalancesByAllowedTypes,
  getLeaveBalanceByUserAndYear,
  updateLeaveBalance,
  updateLeaveBalanceByUserAndType,
  createLeaveBalance,
  softDeleteLeaveBalance
};
