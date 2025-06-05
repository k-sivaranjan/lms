const { AppDataSource } = require('../config/db');
const { LeaveRequest, LeaveStatus } = require('../entities/LeaveRequest');
const { LeaveApproval } = require('../entities/LeaveApproval');

const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);

// Get users on leave for the current day
const getUsersOnLeaveToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await leaveRequestRepo
    .createQueryBuilder('lr')
    .select(['u.id AS userId', 'u.name AS userName'])
    .innerJoin('lr.user', 'u')
    .where('lr.status = :status', { status: LeaveStatus.APPROVED })
    .andWhere(':today BETWEEN lr.startDate AND lr.endDate', { today })
    .groupBy('u.id')
    .addGroupBy('u.name')
    .getRawMany();

  return result.map(row => ({
    id: row.userId,
    name: row.userName
  }));
};

// Get team leave requests for a specific month and year
const getTeamLeave = async ({ userIdArray, month, year, role }) => {
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
    .andWhere('lr.status = :status', { status: LeaveStatus.APPROVED });

  if (role !== 'admin') {
    query.andWhere('lr.user_id IN (:...userIdArray)', { userIdArray });
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
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    leave_type: request.leaveType.name,
    start_date: request.startDate,
    end_date: request.endDate,
    reason: request.reason,
    status: request.status,
    manager_name: request.user.manager?.name || null
  }));
};

// Get team leave requests history
const getTeamRequestsHistoryByManagerId = async (managerId) => {
  const approvals = await leaveApprovalRepo
    .createQueryBuilder('approval')
    .leftJoinAndSelect('approval.leaveRequest', 'leaveRequest')
    .leftJoinAndSelect('leaveRequest.user', 'user')
    .leftJoinAndSelect('leaveRequest.leaveType', 'leaveType')
    .where('approval.approverId = :managerId', { managerId })
    .andWhere('approval.status IN (:...statuses)', {
      statuses: [
        LeaveStatus.APPROVED,
        LeaveStatus.CANCELLED,
        LeaveStatus.REJECTED
      ]
    })
    .orderBy('approval.actedAt', 'DESC')
    .getMany();

  return approvals.map(appr => {
    return {
      approval_id: appr.id,
      leave_request_id: appr.leaveRequest.id,
      employee_name: appr.leaveRequest.user.name,
      leave_type: appr.leaveRequest.leaveType.name,
      start_date: appr.leaveRequest.startDate,
      end_date: appr.leaveRequest.endDate,
      status: appr.status,
      approval_level: appr.approvalLevel,
      updated_at: appr.actedAt,
    };
  });
};

// Create a new leave request
const createLeaveRequest = async ({ userId, managerId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, status, finalApprovalLevel, totalDays }) => {
  const leaveRequest = leaveRequestRepo.create({userId,managerId,leaveTypeId,startDate,endDate,isHalfDay,halfDayType,reason,status,finalApprovalLevel,totalDays});
  return leaveRequestRepo.save(leaveRequest);
};

// Get leave request by ID
const getLeaveRequestById = async (id) => leaveRequestRepo.findOne({ where: { id }, relations: ['user', 'leaveType'] });

// Update leave request status
const updateLeaveRequestStatus = async (id, status) => {
  const leaveRequest = await leaveRequestRepo.findOne({ where: { id } });
  if (!leaveRequest) return null;
  leaveRequest.status = status;
  leaveRequest.updatedAt = new Date();
  return leaveRequestRepo.save(leaveRequest);
};

//Get Incoming Requests
const getIncomingRequests = async (userId) => {
  const approvals = await leaveApprovalRepo
    .createQueryBuilder('approval')
    .leftJoinAndSelect('approval.leaveRequest', 'leaveRequest')
    .leftJoinAndSelect('leaveRequest.user', 'user')
    .leftJoinAndSelect('leaveRequest.leaveType', 'leaveType')
    .where('approval.approverId = :userId', { userId })
    .andWhere('approval.status = :pending', { pending: LeaveStatus.PENDING })
    .getMany();

  const validApprovals = [];

  for (const approval of approvals) {
    const { approvalLevel, leaveRequest } = approval;

    if (approvalLevel === 1) {
      validApprovals.push(approval);
    } else {
      const previousApproval = await leaveApprovalRepo.findOne({
        where: {
          leaveRequest: { id: leaveRequest.id },
          approvalLevel: approvalLevel - 1
        }
      });

      if (previousApproval?.status === LeaveStatus.APPROVED) {
        validApprovals.push(approval);
      }
    }
  }

  return validApprovals.map(appr => ({
    approval_id: appr.id,
    leave_request_id: appr.leaveRequest.id,
    employee_name: appr.leaveRequest.user.name,
    leave_type: appr.leaveRequest.leaveType.name,
    start_date: appr.leaveRequest.startDate,
    end_date: appr.leaveRequest.endDate,
    status: appr.status,
    approval_level: appr.approvalLevel
  }));
};

//Get Requests with Approvals
const getLeaveRequestByIdWithApprovals = async (leaveRequestId) => {
  const request = await leaveRequestRepo.createQueryBuilder('lr')
    .where('lr.id = :id', { id: leaveRequestId })
    .getOne();

  const approvals = await leaveApprovalRepo.createQueryBuilder('la')
    .leftJoinAndSelect('la.approver', 'approver')
    .where('la.leaveRequest = :id', { id: leaveRequestId })
    .getMany();

  return {
    ...request,
    approvals
  };
};

module.exports = {
  getUsersOnLeaveToday,
  getTeamLeave,
  getLeaveHistoryByUserId,
  getTeamRequestsHistoryByManagerId,
  getLeaveRequestByIdWithApprovals,
  createLeaveRequest,
  getLeaveRequestById,
  updateLeaveRequestStatus,
  getIncomingRequests
};