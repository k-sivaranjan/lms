const { Repository, Between, In, IsNull, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');
const { LeaveRequest, LeaveStatus, HalfDayType } = require('../entities/LeaveRequest');
const { AppDataSource } = require('../config/db');

class LeaveRequestRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(LeaveRequest);
  }

  async getUsersOnLeaveToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight

    const result = await this.repository
      .createQueryBuilder('lr')
      .select([
        'u.id AS userId',
        'u.name AS userName',
        'u.email AS userEmail',
        'lr.startDate AS leaveStartDate',
        'lr.endDate AS leaveEndDate',
        'lt.name AS leaveTypeName'
      ])
      .innerJoin('lr.user', 'u')       // Join with User table
      .innerJoin('lr.leaveType', 'lt')  // Join with LeaveType table
      .where('lr.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere(':today BETWEEN lr.startDate AND lr.endDate', { today })
      .getRawMany();  // Use getRawMany to get unprocessed raw results

    // Map the raw result to a more user-friendly structure
    return result.map(row => ({
      id: row.userId,           // Ensure the alias is used correctly
      name: row.userName,
      email: row.userEmail,
      startDate: row.leaveStartDate,
      endDate: row.leaveEndDate,
      leaveType: row.leaveTypeName
    }));
  }

  async getLeaveHistoryByUserId(userId) {
    const leaveRequests = await this.repository.find({
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
  }

  async createLeaveRequest(userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, status, finalApprovalLevel, totalDays) {
    const leaveRequest = this.repository.create({
      userId,
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

    return this.repository.save(leaveRequest);
  }

  async getLeaveRequestById(id) {
    const leaveRequest = await this.repository.findOne({
      where: { id },
      relations: ['user', 'leaveType']
    });
  
    if (leaveRequest) {
      leaveRequest.startDate = new Date(leaveRequest.startDate);
      leaveRequest.endDate = new Date(leaveRequest.endDate);
    }
  
    return leaveRequest;
  }

  async updateLeaveRequestStatus(id, status) {
    const leaveRequest = await this.repository.findOne({ where: { id } });

    if (!leaveRequest) {
      return null;
    }

    leaveRequest.status = status;

    return this.repository.save(leaveRequest);
  }

  async getIncomingRequests(userId, userRole) {
    let query = this.repository
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.user', 'u')
      .leftJoinAndSelect('lr.leaveType', 'lt')
      .leftJoinAndSelect('u.manager', 'mgr');

    if (userRole === 'admin') {
      query = query
        .leftJoinAndSelect('mgr.manager', 'hr')
        .where('(lr.status = :pending AND u.role = :hrRole)', {
          pending: LeaveStatus.PENDING,
          hrRole: 'hr'
        })
        .orWhere('(lr.status = :pendingL2 AND hr.managerId = :userId)', {
          pendingL2: LeaveStatus.PENDING_L2,
          userId
        })
        .orWhere('(lr.status = :pendingL3 AND hr.managerId = :userId)', {
          pendingL3: LeaveStatus.PENDING_L3,
          userId
        });
    } else if (userRole === 'hr') {
      query = query
        .where('(lr.status = :pending AND u.managerId = :userId)', {
          pending: LeaveStatus.PENDING,
          userId
        })
        .orWhere('(lr.status = :pendingL1 AND u.managerId = :userId)', {
          pendingL1: LeaveStatus.PENDING_L1,
          userId
        })
        .orWhere('(lr.status = :pendingL2 AND mgr.managerId = :userId)', {
          pendingL2: LeaveStatus.PENDING_L2,
          userId
        });
    } else if (userRole === 'manager') {
      query = query
        .where('(lr.status = :pending AND u.managerId = :userId)', {
          pending: LeaveStatus.PENDING,
          userId
        })
        .orWhere('(lr.status = :pendingL1 AND u.managerId = :userId)', {
          pendingL1: LeaveStatus.PENDING_L1,
          userId
        });
    }

    const results = await query.getMany();
    
    return results.map(request => ({
      ...request,
      employee_name: request.user.name,
      leave_type: request.leaveType.name,
      start_date: request.startDate,
      end_date: request.endDate
    }));
  }
}

module.exports = LeaveRequestRepository;