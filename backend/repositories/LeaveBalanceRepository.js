const { AppDataSource } = require('../config/db');
const { LeaveBalance } = require('../entities/LeaveBalance');
const { In } = require('typeorm');

const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

// Get all leave balances by allowed type
const getLeaveBalancesByAllowedTypes = async ({userId, year, allowedLeaveTypeIds}) => {
  return leaveBalanceRepo.find({
    where: {
      userId,
      year,
      leaveTypeId: In(allowedLeaveTypeIds),
    },
    relations: ['leaveType']
  });
};
// Get all leave balances for a user in a specific year
const getLeaveBalanceByUserAndYear = async (userId, year) => {
  return leaveBalanceRepo.find({ where: { userId, year }, relations: ['leaveType'] });
};

// Update the balance and used fields of a leave balance record
const updateLeaveBalance = async (id, balance, used) => {
  const leaveBalance = await leaveBalanceRepo.findOne({ where: { id } });
  if (!leaveBalance) return null;
  leaveBalance.balance = Number(balance);
  leaveBalance.used = Number(used);
  return leaveBalanceRepo.save(leaveBalance);
};

// Update the balance and used fields of a leave balance record based on user ID, leave type ID, and year
const updateLeaveBalanceByUserAndType = async (userId, leaveTypeId, year, balanceChange, usedChange) => {
  const leaveBalance = await leaveBalanceRepo.findOne({ where: { userId, leaveTypeId, year } });

  if (!leaveBalance) return null;

  leaveBalance.balance +=  Number(balanceChange);
  leaveBalance.used +=  Number(usedChange)

  return leaveBalanceRepo.save(leaveBalance);
};

// Create a new leave balance record with specified values
const createLeaveBalance = async (userId, leaveTypeId, year, balance, used = 0) => {
  const leaveBalance = leaveBalanceRepo.create({ userId, leaveTypeId, year, balance, used });
  return leaveBalanceRepo.save(leaveBalance);
};

module.exports = {
  getLeaveBalancesByAllowedTypes,
  getLeaveBalanceByUserAndYear,
  updateLeaveBalance,
  updateLeaveBalanceByUserAndType,
  createLeaveBalance
};
