const { AppDataSource } = require('../config/db');
const { LeaveStatus, HalfDayType } = require('../entities/LeaveRequest');
const { LeaveType } = require('../entities/LeaveType');
const { LeaveBalance } = require('../entities/LeaveBalance');


const leaveTypeRepository = require('../repositories/LeaveTypeRepository');
const leaveRequestRepository = require('../repositories/LeaveRequestRepository');
const leaveBalanceRepository = require('../repositories/LeaveBalanceRepository');
const userRepository = require('../repositories/UserRepository');

const getUsersOnLeaveToday = async () => {
  return leaveRequestRepository.getUsersOnLeaveToday();
};

const getTeamLeave = async (userIdArray, month, year) => {
  return await leaveRequestRepository.getTeamLeave(userIdArray, month, year);
};

const getLeaveBalance = async (userId, year) => {
  return leaveBalanceRepository.getLeaveBalanceByUserAndYear(userId, year);
};

const getLeaveTypes = async () => {
  return leaveTypeRepository.getAllLeaveTypes();
};

const requestLeave = async (
  userId,
  leaveTypeId,
  startDate,
  endDate,
  isHalfDay,
  halfDayType,
  reason
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);


  const totalDays = isHalfDay ? 0.5 : Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`totaldays ${totalDays}`)

  const balances = await leaveBalanceRepository.getLeaveBalanceByUserAndYear(
    userId,
    new Date(startDate).getFullYear()
  );
  const leaveBalance = balances.find(balance => balance.leaveTypeId === Number(leaveTypeId));

  if (!leaveBalance) {
    throw new Error('Leave balance not found for the user or leave type');
  }

  const totalUsedLeave = leaveBalance.used;
  const maxLeaveDays = leaveBalance.balance + leaveBalance.used;

  if (leaveTypeId != 9 && leaveTypeId != 10) {
    if (totalUsedLeave + totalDays > maxLeaveDays) {
      throw new Error(`You have exceeded the maximum allowed leave days for this leave type. Max allowed: ${maxLeaveDays} days.`);
    }
  }

  const leaveType = await leaveTypeRepository.getLeaveTypeById(leaveTypeId);
  const multiApprover = leaveType?.multiApprover || 1;

  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const role = user.role;
  const managerId = user.managerId;

  const maxApproverByRole = role === 'employee' ? 3 : role === 'manager' ? 2 : 1;
  const finalApprovalLevel = totalDays >= 5 ? maxApproverByRole : Math.min(multiApprover, maxApproverByRole);

  let level2ApproverId = null;
  if (managerId) {
    const manager = await userRepository.getUserById(managerId);
    level2ApproverId = manager?.managerId;
  }

  let level3ApproverId = null;
  if (level2ApproverId) {
    const level2Manager = await userRepository.getUserById(level2ApproverId);
    level3ApproverId = level2Manager?.managerId;
  }

  let initialStatus;
  if (leaveTypeId ===9){
    initialStatus = "Approved"
  }else{
    initialStatus = finalApprovalLevel > 1 ? LeaveStatus.PENDING_L1 : LeaveStatus.PENDING;
  }

  const leaveRequest = await leaveRequestRepository.createLeaveRequest(
    userId,
    leaveTypeId,
    new Date(startDate),
    new Date(endDate),
    isHalfDay,
    halfDayType,
    reason,
    initialStatus,
    finalApprovalLevel,
    totalDays
  );

  return leaveRequest;
};

const getLeaveHistory = async (userId) => {
  return leaveRequestRepository.getLeaveHistoryByUserId(userId);
};

const cancelLeave = async (leaveRequestId) => {
  const leaveRequest = await leaveRequestRepository.getLeaveRequestById(leaveRequestId);

  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }
  const { status, userId, leaveTypeId, startDate, totalDays } = leaveRequest;
  console.log(status, userId, leaveTypeId, startDate, totalDays)

  await leaveRequestRepository.updateLeaveRequestStatus(leaveRequestId, LeaveStatus.CANCELLED);

  if (status === LeaveStatus.APPROVED) {
    const leaveTypesOnlyUsed = [9, 10];

    const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
    const year = startDateObj.getFullYear();
    console.log(`totaldays ${totalDays}`)

    if (leaveTypesOnlyUsed.includes(leaveTypeId)) {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
        userId,
        leaveTypeId,
        year,
        0,
        -totalDays
      );
    } else {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
        userId,
        leaveTypeId,
        year,
        totalDays,
        -totalDays
      );
    }
  }

  return { success: true, message: 'Leave request cancelled successfully' };
};

const getIncomingRequests = async (userId) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    return [];
  }

  return leaveRequestRepository.getIncomingRequests(userId, user.role);
};

const approveLeave = async (requestId) => {
  const leaveRequest = await leaveRequestRepository.getLeaveRequestById(requestId);
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  const { userId, leaveTypeId, status, totalDays, finalApprovalLevel, startDate } = leaveRequest;

  if (totalDays === null) {
    throw new Error('Total days not calculated');
  }

  const leaveDays = totalDays;
  const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
  const year = startDateObj.getFullYear();

  if (status === LeaveStatus.PENDING) {
    await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.APPROVED);

    if (leaveTypeId === 9 || leaveTypeId === 10) {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
        userId,
        leaveTypeId,
        year,
        0,
        leaveDays
      );
    } else {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
        userId,
        leaveTypeId,
        year,
        -leaveDays,
        leaveDays
      );
    }

    return { nextStep: 'Approved' };
  } else if (status === LeaveStatus.PENDING_L1) {
    await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.PENDING_L2);
    return { nextStep: 'Approved (L2)' };
  } else if (status === LeaveStatus.PENDING_L2) {
    if (finalApprovalLevel === 3) {
      await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.PENDING_L3);
      return { nextStep: 'Approved (L3)' };
    } else {
      await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.APPROVED);

      if (leaveTypeId === 9 || leaveTypeId === 10) {
        await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
          userId,
          leaveTypeId,
          year,
          0,
          leaveDays
        );
      } else {
        await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
          userId,
          leaveTypeId,
          year,
          -leaveDays,
          leaveDays
        );
      }

      return { nextStep: 'Approved' };
    }
  } else if (status === LeaveStatus.PENDING_L3) {
    await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.APPROVED);

    if (leaveTypeId === 9 || leaveTypeId === 10) {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
        userId,
        leaveTypeId,
        year,
        0,
        leaveDays
      );
    } else {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType(
        userId,
        leaveTypeId,
        year,
        -leaveDays,
        leaveDays
      );
    }

    return { nextStep: 'Approved' };
  }

  return { message: 'Leave request already processed' };
};

const rejectLeave = async (requestId) => {
  const leaveRequest = await leaveRequestRepository.getLeaveRequestById(requestId);
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.REJECTED);

  return { success: true, message: 'Leave request rejected successfully' };
};

const addLeaveType = async (name, maxPerYear, multiApprover = 1) => {
  return leaveTypeRepository.createLeaveType(name, maxPerYear, multiApprover);
};

const updateLeaveType = async (id, name, maxPerYear, multiApprover = 1) => {
  return leaveTypeRepository.updateLeaveType(id, name, maxPerYear, multiApprover);
};

const deleteLeaveType = async (id) => {
  return leaveTypeRepository.deleteLeaveType(id);
};

module.exports = {
  getUsersOnLeaveToday,
  getTeamLeave,
  getLeaveBalance,
  getLeaveTypes,
  requestLeave,
  getLeaveHistory,
  cancelLeave,
  getIncomingRequests,
  approveLeave,
  rejectLeave,
  addLeaveType,
  updateLeaveType,
  deleteLeaveType
};