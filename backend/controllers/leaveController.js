const {
  getUsersOnLeaveToday,
  getTeamLeave,
  getLeaveBalanceByType,
  requestLeave,
  getLeavePolicy,
  getLeavePolicyByRole,
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
} = require('../models/leaveModel');

const { getUserById } = require('../models/userModel');

// Fetch users who are on leave today
const fetchUsersOnLeaveToday = async (req, res) => {
  try {
    const users = await getUsersOnLeaveToday();
    if (users.length === 0) return res.status(204).json({ message: 'No users are on leave today.' });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Fetch users on leave error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users on leave today' });
  }
};

// Fetch team members with their respective leave Details
const fetchTeamLeave = async (req, res) => {
  try {
    const { teamMembers, month, year } = req.query;
    if (!teamMembers || !month || !year) return res.status(400).json({ success: false, error: 'Missing teamMembers, month, or year' });
    const userIdArray = teamMembers.split(',').map(id => parseInt(id.trim()));
    const leaveRequests = await getTeamLeave({ userIdArray, month, year });
    res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    console.error('Error fetching team leave requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave requests' });
  }
};

// Fetch user's leave balance
const fetchLeaveBalance = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentYear = new Date().getFullYear();

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const leavePolicies = await getLeavePolicyByRole(user.roleId);

    const allowedLeaveTypeIds = leavePolicies.map(p => p.leaveType.id);
    if (allowedLeaveTypeIds.length === 0) return res.status(403).json({ success: false, error: 'This role has no leave types assigned.' });

    const leaveBalances = await getLeaveBalanceByType({ userId, year: currentYear, allowedLeaveTypeIds });
    if (leaveBalances.length === 0) return res.status(404).json({ success: false, error: 'No leave balance found for the current year.' });

    let totalBalance = 0, totalLeaves = 0;
    const leaveDetails = leaveBalances.map(item => {
      const maxPerYear = item.leaveType?.maxPerYear || 0;
      const total = item.balance + item.used;
      totalBalance += item.balance;
      totalLeaves += total;

      return {
        leave_id: item.leaveTypeId,
        leave_type: item.leaveType?.name,
        total,
        balance: item.balance,
        used: item.used,
        maxPerYear
      };
    });

    res.status(200).json({ success: true, role: user.role.name, totalBalance, totalLeaves, leaveDetails });
  } catch (error) {
    console.error('Fetch leave balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave balance' });
  }
};

//Fetch Leave Types By Role
const fetchLeaveTypesByRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const leavePolicies = await getLeavePolicyByRole(user.roleId);
    const leaveTypes = leavePolicies.map(leave => ({
      id: leave.leaveType.id,
      name: leave.leaveType.name
    }));
    res.status(200).json({ success: true, leaveTypes });
  } catch (error) {
    console.error('Error in fetchLeaveTypesByRole:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave types by role' });
  }
};

// Fetch all available leave types
const fetchLeaveTypes = async (req, res) => {
  try {
    const leavePolicies = await getLeavePolicy();
    if (!leavePolicies || leavePolicies.length === 0) return res.status(404).json({ success: false, error: 'No leave policies found.' });

    const grouped = {};
    leavePolicies.forEach(policy => {
      const { leaveTypeId, leaveTypeName, maxPerYear, multiApprover, accrualPerYear, maxApplicableRoleId, applicableFromRole } = policy;
      const existing = grouped[leaveTypeId];
      if (!existing || maxApplicableRoleId > existing.maxRoleId) {
        grouped[leaveTypeId] = {
          leaveTypeId,
          leaveName: leaveTypeName,
          maxPerYear,
          multiApprover,
          accrualPerYear,
          applicableFromRole,
          maxRoleId: maxApplicableRoleId,
        };
      }
    });

    const formattedLeaveTypes = Object.values(grouped).map(item => ({
      leaveTypeId: item.leaveTypeId,
      leaveName: item.leaveName,
      maxPerYear: item.maxPerYear,
      multiApprover: item.multiApprover,
      accrualPerYear: item.accrualPerYear,
      applicableFromRole: item.applicableFromRole,
      maxRoleId: item.maxRoleId
    }));

    res.status(200).json({ success: true, leaveTypes: formattedLeaveTypes });
  } catch (error) {
    console.error('Fetch leave types error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave types' });
  }
};

// Request a leave
const requestLeaveHandler = async (req, res) => {
  try {
    const { userId, managerId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, totalDays } = req.body;

    if (
      !userId || !managerId || !leaveTypeId || !startDate || !endDate ||
      totalDays == null || isHalfDay == null
    ) return res.status(400).json({ success: false, error: 'Missing required fields in request body' });

    const result = await requestLeave({ userId, managerId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, totalDays });
    res.status(201).json({ success: true, message: 'Leave requested successfully', result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
};

// Get leave history
const getLeaveHistoryHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const leaveHistory = await getLeaveHistory(userId);
    res.status(200).json({ success: true, leaveHistory });
  } catch (err) {
    console.error('Get leave history error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get Requests History
const getRequestsHistoryHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requestsHistory = await getRequestsHistory(userId);
    res.status(200).json({ success: true, requestsHistory });
  } catch (err) {
    console.error('Get requests history error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Cancel a leave request
const cancelLeaveHandler = async (req, res) => {
  try {
    const leaveRequestId = parseInt(req.params.leaveRequestId);
    const comments = req.body;
    await cancelLeave(leaveRequestId, comments);
    res.status(200).json({ success: true, message: 'Leave canceled successfully' });
  } catch (err) {
    console.error('Cancel leave error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get incoming leave requests for approval
const getIncomingRequestsHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requests = await getIncomingRequests(userId);
    res.status(200).json({ success: true, incomingRequests: requests });
  } catch (err) {
    console.error('Get incoming requests error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch incoming requests' });
  }
};

// Approve a leave request
const approveLeaveHandler = async (req, res) => {
  try {
    const requestId = parseInt(req.params.approveId);
    const approverId = parseInt(req.body.approverId);
    const comments = req.body.comments || "";
    const result = await approveLeave(requestId, approverId, comments);
    res.status(200).json({ success: true, message: 'Leave approval processed', result });
  } catch (err) {
    console.error('Approve leave error:', err);
    res.status(500).json({ success: false, error: 'Failed to approve leave' });
  }
};

// Reject a leave request
const rejectLeaveHandler = async (req, res) => {
  try {
    const requestId = parseInt(req.params.rejectId);
    const approverId = parseInt(req.body.approverId);
    const comments = req.body.comments || "";
    const result = await rejectLeave(requestId, approverId, comments);
    res.status(200).json({ success: true, message: 'Leave rejected', result });
  } catch (err) {
    console.error('Reject leave error:', err);
    res.status(500).json({ success: false, error: 'Failed to reject leave' });
  }
};

// Create a new leave type
const createLeaveTypeHandler = async (req, res) => {
  try {
    const { name, maxPerYear, multiApprover, accrual_per_year, roleId } = req.body;
    const result = await addLeaveType({ name, maxPerYear, multiApprover });
    await addLeavePolicy({ id: result.id, accrual_per_year, roleId });
    await addLeaveBalance({ leaveTypeId: result.id, balance: maxPerYear, used: 0 })
    res.status(200).json({ success: true, message: 'Leave type added successfully', result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add leave type' });
  }
};

// Update an existing leave type
const updateLeaveTypeHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, maxPerYear, multiApprover, accrual_per_year, roleId } = req.body;
    const result = await updateLeaveType({ id, name, maxPerYear, multiApprover });
    await updateLeavePolicy({ id, accrual_per_year, roleId });
    res.status(200).json({ success: true, message: 'Leave type updated successfully', result });
  } catch (err) {
    console.error('Update leave type error:', err);
    res.status(500).json({ success: false, error: 'Failed to update leave type' });
  }
};

// Delete a leave type
const deleteLeaveTypeHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteLeaveType(id);
    res.status(200).json({ success: true, message: 'Leave type deleted successfully', result });
  } catch (err) {
    console.error('Delete leave type error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete leave type' });
  }
};

module.exports = {
  fetchUsersOnLeaveToday,
  fetchTeamLeave,
  fetchLeaveBalance,
  fetchLeaveTypesByRole,
  fetchLeaveTypes,
  requestLeaveHandler,
  getRequestsHistoryHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler,
  approveLeaveHandler,
  rejectLeaveHandler,
  createLeaveTypeHandler,
  updateLeaveTypeHandler,
  deleteLeaveTypeHandler
};