const { AppDataSource } = require('../config/db');
const { LeaveApproval } = require('../entities/LeaveApproval');

const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);

// Bulk insert into Approval table
const bulkInsertApprovals = async (approvals) => {
  return leaveApprovalRepo
    .createQueryBuilder()
    .insert()
    .into(LeaveApproval)
    .values(approvals)
    .execute();
};

// Get Approval by ID
const getApprovalById = async (approvalId) => {
  return leaveApprovalRepo.findOne({
    where: { id: approvalId ,deletedAt:null}
  });
};

// Get Approval by leave request and approver
const getApprovalByRequestAndApprover = async (leaveRequestId, approverId) => {
  return leaveApprovalRepo.findOne({
    where: {
      leaveRequest: { id: leaveRequestId },
      approverId
    }
  });
};

// Update approval status with comment and actedAt
const updateApprovalStatus = async (approvalId, status, comments) => {
  await leaveApprovalRepo.update(
    { id: approvalId },
    {
      status,
      comments,
      actedAt: new Date()
    }
  );
};

// Get next pending approval based on level
const getNextPendingApproval = async (leaveRequestId, nextLevel) => {
  return leaveApprovalRepo.findOne({
    where: {
      leaveRequest: { id: leaveRequestId },
      approvalLevel: nextLevel,
      status: 1
    }
  });
};


module.exports = {
  bulkInsertApprovals,
  getApprovalById,
  getApprovalByRequestAndApprover,
  updateApprovalStatus,
  getNextPendingApproval,
};