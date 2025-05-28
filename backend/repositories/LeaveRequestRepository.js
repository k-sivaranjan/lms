const { AppDataSource } = require('../config/db');
const { LeaveRequest, LeaveStatus } = require('../entities/LeaveRequest');

const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);

// Get users on leave for the current day
const getUsersOnLeaveToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await leaveRequestRepo
    .createQueryBuilder('lr')
    .select(['u.id AS userId', 'u.name AS userName', 'u.email AS userEmail', 'lr.startDate AS leaveStartDate', 'lr.endDate AS leaveEndDate', 'lt.name AS leaveTypeName'])
    .innerJoin('lr.user', 'u')
    .innerJoin('lr.leaveType', 'lt')
    .where('lr.status = :status', { status: LeaveStatus.APPROVED })
    .andWhere(':today BETWEEN lr.startDate AND lr.endDate', { today })
    .getRawMany();

  return result.map(row => ({
    id: row.userId,
    name: row.userName,
    email: row.userEmail,
    startDate: row.leaveStartDate,
    endDate: row.leaveEndDate,
    leaveType: row.leaveTypeName
  }));
};

// Get team leave requests for a specific month and year
const getTeamLeave = async (userIds, month, year, role) => {
  const query = leaveRequestRepo
    .createQueryBuilder('lr')
    .leftJoin('lr.leaveType', 'lt')
    .select([
      'lr.id',
      'lr.userId',
      'lr.leaveTypeId',
      'lr.startDate',
      'lr.endDate',
      'lr.reason',
      'lr.status',
      'lt.name AS leaveTypeName'
    ])
    .andWhere('MONTH(lr.start_date) = :month', { month })
    .andWhere('YEAR(lr.start_date) = :year', { year })
    .andWhere('lr.status = :status', { status: 'Approved' });

  if (role !== 'admin') {
    query.andWhere('lr.user_id IN (:...userIds)', { userIds });
  }

  return await query.getRawMany();
};

// Get leave history by user ID
const getLeaveHistoryByUserId = async (userId) => {
  const leaveRequests = await leaveRequestRepo.find({
    where: { userId },
    relations: ['leaveType', 'user', 'user.manager'],
    order: { createdAt: 'DESC' }
  });

  return leaveRequests.map(request => ({
    id: request.id,
    leave_type: request.leaveType.name,
    start_date: request.startDate,
    end_date: request.endDate,
    reason: request.reason,
    status: request.status,
    manager_name: request.user.manager?.name || null
  }));
};

// Create a new leave request
const createLeaveRequest = async (userId,managerId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, status, finalApprovalLevel, totalDays) => {
  const leaveRequest = leaveRequestRepo.create({
    userId,
    managerId,
    leaveTypeId,
    startDate,
    endDate,
    isHalfDay,
    halfDayType,
    reason,
    status,
    finalApprovalLevel,
    totalDays
  });
  return leaveRequestRepo.save(leaveRequest);
};

// Get leave request by ID
const getLeaveRequestById = async (id) => leaveRequestRepo.findOne({ where: { id }, relations: ['user', 'leaveType'] });

// Update leave request status
const updateLeaveRequestStatus = async (id, status) => {
  const leaveRequest = await leaveRequestRepo.findOne({ where: { id } });
  if (!leaveRequest) return null;
  leaveRequest.status = status;
  return leaveRequestRepo.save(leaveRequest);
};

// Get incoming leave requests based on user role
const getIncomingRequests = async (userId, userRole) => {
  let query = leaveRequestRepo.createQueryBuilder('lr')
    .leftJoinAndSelect('lr.user', 'u')
    .leftJoinAndSelect('lr.leaveType', 'lt')
    .leftJoinAndSelect('u.manager', 'mgr');

  if (userRole === 'admin') {
    query = query
      .leftJoinAndSelect('mgr.manager', 'hr')
      .where('(lr.status = :pending AND u.role = :hrRole)', { pending: LeaveStatus.PENDING, hrRole: 'hr' })
      .orWhere('(lr.status = :pendingL3 AND hr.managerId = :userId)', { pendingL3: LeaveStatus.PENDING_L3, userId })
      .orWhere('(lr.status = :pendingL2 AND mgr.managerId = :userId)', { pendingL2: LeaveStatus.PENDING_L2, userId });
  }

  else if (userRole === 'hr') {
    query = query
      .where('(lr.status = :pending AND u.managerId = :userId)', { pending: LeaveStatus.PENDING, userId })
      .orWhere('(lr.status = :pendingL1 AND u.managerId = :userId)', { pendingL1: LeaveStatus.PENDING_L1, userId })
      .orWhere('(lr.status = :pendingL2 AND mgr.managerId = :userId)', { pendingL2: LeaveStatus.PENDING_L2, userId });
  } else if (userRole === 'manager') {
    query = query
      .where('(lr.status = :pending AND u.managerId = :userId)', { pending: LeaveStatus.PENDING, userId })
      .orWhere('(lr.status = :pendingL1 AND u.managerId = :userId)', { pendingL1: LeaveStatus.PENDING_L1, userId });
  }

  const results = await query.getMany();
  return results.map(request => ({
    ...request,
    employee_name: request.user.name,
    leave_type: request.leaveType.name,
    start_date: request.startDate,
    end_date: request.endDate
  }));
};

module.exports = {
  getUsersOnLeaveToday,
  getTeamLeave,
  getLeaveHistoryByUserId,
  createLeaveRequest,
  getLeaveRequestById,
  updateLeaveRequestStatus,
  getIncomingRequests
};
