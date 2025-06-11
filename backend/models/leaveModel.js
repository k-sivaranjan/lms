const { LeaveStatus } = require('../entities/LeaveRequest');

const leavePolicyRepository = require('../repositories/LeavePolicyRepository');
const leaveTypeRepository = require('../repositories/LeaveTypeRepository');
const leaveApprovalRepository = require('../repositories/LeaveApprovalRepository');
const leaveRequestRepository = require('../repositories/LeaveRequestRepository');
const leaveBalanceRepository = require('../repositories/LeaveBalanceRepository');
const userRepository = require('../repositories/UserRepository');

// Get users on leave today
const getUsersOnLeaveToday = async () => {
  return leaveRequestRepository.getUsersOnLeaveToday();
};

// Get team leave data
const getTeamLeave = async ({ userIdArray, month, year }) => {
  return await leaveRequestRepository.getTeamLeave({ userIdArray, month, year });
};

// Get leave balance by user and year
const getLeaveBalance = async (userId, year) => {
  return leaveBalanceRepository.getLeaveBalanceByUserAndYear(userId, year);
};

//Get leave balance by allowed type
const getLeaveBalanceByType = async ({ userId, year, allowedLeaveTypeIds }) => {
  return leaveBalanceRepository.getLeaveBalancesByAllowedTypes({ userId, year, allowedLeaveTypeIds })
}

// Get all leave types
const getLeaveTypes = async () => {
  return leaveTypeRepository.getAllLeaveTypes();
};

//Get Leave Polcies By Role
const getLeavePolicyByRole = async (roleId) => {
  return leavePolicyRepository.getLeavePoliciesByRoleId(roleId)
};

//Get Leave Policy
const getLeavePolicy = async () => {
  return leavePolicyRepository.getAllPolicy();
}

//Request Leave
const requestLeave = async ({
  userId, managerId, leaveTypeId, startDate,
  endDate, isHalfDay, halfDayType, reason, totalDays
}) => {
  const year = new Date(startDate).getFullYear();

  // Get Leave Type and Validate
  const leaveType = await leaveTypeRepository.getLeaveTypeById(leaveTypeId);
  if (!leaveType) throw new Error('Leave type not found');

  const maxPerYear = leaveType.maxPerYear;
  const multiApprover = leaveType.multiApprover;
  const isAutoApprove = multiApprover === 0 || multiApprover === null;

  // Balance Check
  if (maxPerYear && maxPerYear > 0) {
    const balances = await leaveBalanceRepository.getLeaveBalanceByUserAndYear(userId, year);
    const leaveBalance = balances.find(balance => balance.leaveTypeId === Number(leaveTypeId));
    if (!leaveBalance) throw new Error('Leave balance not found');

    const totalUsedLeave = leaveBalance.used;
    const maxLeaveDays = leaveBalance.balance + leaveBalance.used;

    if (totalUsedLeave + totalDays > maxLeaveDays) {
      throw new Error(`Exceeded allowed leave days. Max allowed: ${maxLeaveDays}`);
    }
  }

  // Determine approval levels
  const user = await userRepository.getUserById(userId);
  if (!user) throw new Error('User not found');

  const maxApproverByRole = user.role.level;
  const finalApprovalLevel = totalDays >= 5
    ? maxApproverByRole
    : Math.min(multiApprover, maxApproverByRole);

  // Determine initial leave request status
  const initialStatus = isAutoApprove
    ? LeaveStatus.APPROVED
    : (finalApprovalLevel > 1 ? LeaveStatus.PENDING_L1 : LeaveStatus.PENDING);

  // Create leave request
  const leaveRequest = await leaveRequestRepository.createLeaveRequest({
    userId,
    managerId,
    leaveTypeId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isHalfDay,
    halfDayType,
    reason,
    status: initialStatus,
    finalApprovalLevel,
    totalDays,
  });
  const startYear = new Date(startDate).getFullYear();

  // Create approval entries
  let currentApproverId = managerId;
  const approvals = [];

  if (isAutoApprove && finalApprovalLevel === 0) {
    await leaveBalanceRepository.updateLeaveBalanceByUserAndType({userId, leaveTypeId, year:startYear, balanceChange:-totalDays, usedChange:totalDays})
    approvals.push({
      leaveRequestId: leaveRequest.id,
      approverId: userId,
      approvalLevel: 1,
      status: LeaveStatus.APPROVED,
      comments: "Auto-approved (Emergency Leave)",
      createdAt: new Date()
    });
  }

  for (let level = 1; level <= finalApprovalLevel; level++) {
    const approverId = currentApproverId;

    if (!approverId) break;

    approvals.push({
      leaveRequestId: leaveRequest.id,
      approverId,
      approvalLevel: level,
      status: LeaveStatus.PENDING,
      comments: null,
      createdAt: new Date()
    });

    if (!isAutoApprove) {
      const approver = await userRepository.getUserById(currentApproverId);
      currentApproverId = approver?.managerId;
    }
  }

  if (approvals.length > 0) {
    await leaveApprovalRepository.bulkInsertApprovals(approvals);
  }

  return leaveRequest;
};

// Get leave history of a specific user
const getLeaveHistory = async (userId) => {
  return leaveRequestRepository.getLeaveHistoryByUserId(userId);
};

//Get All Request Approved/Rejected History
const getRequestsHistory = async (userId) => {
  return leaveRequestRepository.getTeamRequestsHistoryByManagerId(userId);
}

//Cancel Leave
const cancelLeave = async (leaveRequestId, comments) => {
  const leaveRequest = await leaveRequestRepository.getLeaveRequestByIdWithApprovals(leaveRequestId);

  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  const { status, userId, leaveTypeId, startDate, totalDays, approvals } = leaveRequest;

  // Cancel each approval
  if (approvals && approvals.length > 0) {
    for (const approval of approvals) {
      if (approval.status !== LeaveStatus.CANCELLED) {
        await leaveApprovalRepository.updateApprovalStatus(approval.id, LeaveStatus.CANCELLED, comments);
      }
    }
  }

  // Cancel leave request
  await leaveRequestRepository.updateLeaveRequestStatus(leaveRequestId, LeaveStatus.CANCELLED);

  // Adjust leave balance if already approved
  if (status === LeaveStatus.APPROVED) {
    const leaveTypesOnlyUsed = [10];
    const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
    const year = startDateObj.getFullYear();

    if (leaveTypesOnlyUsed.includes(leaveTypeId)) {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType({userId,leaveTypeId,year,balanceChange :null,usedChange:-totalDays});
    } else {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType({userId,leaveTypeId,year,balanceChange:totalDays,usedChange:-totalDays});
    }
  }

  return { success: true, message: 'Leave request and related approvals cancelled successfully' };
};

// Get incoming requests for a specific user
const getIncomingRequests = async (userId) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    return [];
  }

  return leaveRequestRepository.getIncomingRequests(userId, user.role.name);
};

// Approve a leave request
const approveLeave = async (approvalId, approverId, comments = null) => {
  // Get the approval record using approvalId
  const approval = await leaveApprovalRepository.getApprovalById(approvalId);
  if (!approval) throw new Error('Approval record not found');

  // Check if the correct approver is taking action
  if (approval.approverId !== approverId) {
    throw new Error('This approver is not authorized for this approval');
  }

  if (approval.status !== 1) {
    throw new Error('Leave already acted on by this approver');
  }

  const requestId = approval.leaveRequestId; // Extract leave request ID from approval
  const leaveRequest = await leaveRequestRepository.getLeaveRequestById(requestId);
  if (!leaveRequest) throw new Error('Leave request not found');

  // Approve the current level
  await leaveApprovalRepository.updateApprovalStatus(approvalId, LeaveStatus.APPROVED, comments);

  const currentLevel = approval.approvalLevel;
  const finalLevel = leaveRequest.finalApprovalLevel;

  if (currentLevel < finalLevel) {
    // Don't touch the next level yet — they’ll see it in their incoming list
    let nextStatus;
    if (currentLevel === 1) nextStatus = LeaveStatus.PENDING_L2;
    else if (currentLevel === 2) nextStatus = LeaveStatus.PENDING_L3;
    else nextStatus = LeaveStatus.APPROVED;

    await leaveRequestRepository.updateLeaveRequestStatus(requestId, nextStatus);
    return { message: `Approved. Moved to level ${currentLevel + 1}` };

  } else {
    // Final level — fully approve and update leave balance
    await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.APPROVED);

    const { userId, leaveTypeId, totalDays, startDate } = leaveRequest;
    const startYear = new Date(startDate).getFullYear();

    if (leaveTypeId === 9 || leaveTypeId === 10) {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType({userId, leaveTypeId, year:startYear, balanceChange :null, usedChange:totalDays});
    } else {
      await leaveBalanceRepository.updateLeaveBalanceByUserAndType({userId, leaveTypeId, year:startYear, balanceChange:-totalDays, usedChange:totalDays});
    }

    return { message: 'Leave fully approved and balance updated' };
  }
};

//Reject  a leave
const rejectLeave = async (approvalId, approverId, comments = null) => {
  // Get the approval record using approvalId
  const approval = await leaveApprovalRepository.getApprovalById(approvalId);
  if (!approval) throw new Error('Approval record not found');

  // Verify that the correct approver is acting
  if (approval.approverId !== approverId) {
    throw new Error('This approver is not authorized to act on this request');
  }

  if (approval.status !== LeaveStatus.PENDING) {
    throw new Error('Leave already acted on by this approver');
  }

  // Mark this approval as rejected
  await leaveApprovalRepository.updateApprovalStatus(approvalId, LeaveStatus.REJECTED, comments);

  // Update the entire leave request status to REJECTED
  const requestId = approval.leaveRequestId;
  await leaveRequestRepository.updateLeaveRequestStatus(requestId, LeaveStatus.REJECTED);

  return { message: 'Leave request rejected and status updated' };
};

// Add a new leave type
const addLeaveType = async ({ name, maxPerYear, multiApprover = 1 }) => {
  return leaveTypeRepository.createLeaveType({ name, maxPerYear, multiApprover });
};

//Add a new leave Policy
const addLeavePolicy = async ({ id, accrual_per_year, roleId }) => {
  return leavePolicyRepository.createLeavePolicy({ id, accrual_per_year, roleId })
}

//Add Leave Balance
const addLeaveBalance = async({leaveTypeId,balance,used})=>{
  return leaveBalanceRepository.createLeaveBalance({leaveTypeId,balance,used})
}

// Update an existing leave type
const updateLeaveType = async ({ id, name, maxPerYear, multiApprover = 1 }) => {
  return leaveTypeRepository.updateLeaveType({ id, name, maxPerYear, multiApprover });
};

//Update an existing leave policy
const updateLeavePolicy = async ({ id, accrual_per_year, roleId }) => {
  return leavePolicyRepository.updateLeave({ id, accrual_per_year, roleId })
}

// Delete a leave type
const deleteLeaveType = async (id) => {
  leaveTypeRepository.deleteLeaveType(id);
  leavePolicyRepository.softDeletePolicy(id);
  leaveBalanceRepository.softDeleteLeaveBalance(id);
};

module.exports = {
  getUsersOnLeaveToday,
  getTeamLeave,
  getLeaveBalance,
  getLeaveBalanceByType,
  getLeaveTypes,
  getLeavePolicy,
  getLeavePolicyByRole,
  requestLeave,
  getLeaveHistory,
  getRequestsHistory,
  cancelLeave,
  getIncomingRequests,
  approveLeave,
  rejectLeave,
  addLeaveType,
  addLeavePolicy,
  addLeaveBalance,
  updateLeaveType,
  updateLeavePolicy,
  deleteLeaveType
};