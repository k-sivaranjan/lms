const { AppDataSource } = require('../config/db');
const { LeaveApproval } = require('../entities/LeaveApproval');

const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);

//Insert into Approval table
const bulkInsertApprovals = async (approvals) => {
  return leaveApprovalRepo
    .createQueryBuilder()
    .insert()
    .into('leave_approvals')
    .values(approvals)
    .execute();
};

//Get Approval by ID
const getApprovalById = async (approvalId) => {
  return await leaveApprovalRepo.findOne({ where: { id: approvalId } });
};

//Get approval by Request and approver
const getApprovalByRequestAndApprover = async (leaveRequestId, approverId) => {
  return leaveApprovalRepo.findOne({
    where: {
      leaveRequest: { id: leaveRequestId },
      approverId
    }
  });
};

//Update approval status
const updateApprovalStatus = async (approvalId, status, comments) => {
  
  await leaveApprovalRepo.update(
    { id: approvalId },
    {
      status,
      comments:comments,
      actedAt: new Date()
    }
  );
};

//Get Next Pending Approval
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
  getApprovalByRequestAndApprover,
  getApprovalById,
  updateApprovalStatus,
  getNextPendingApproval
};