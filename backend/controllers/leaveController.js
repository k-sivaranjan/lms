const {
  getUsersOnLeaveToday,
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
} = require('../models/leaveModel');

const fetchUsersOnLeaveToday = async (req, res) => {
  try {
    const users = await getUsersOnLeaveToday();
    if (users.length === 0) {
      return res.status(204).json({ message: 'No users are on leave today.' });
    }
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users on leave today' });
  }
};

const fetchLeaveBalance = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentYear = new Date().getFullYear();
    const balance = await getLeaveBalance(userId, currentYear);

    if (balance.length === 0) {
      return res.status(404).json({ error: 'No leave balance found for the current year.' });
    }

    let totalBalance = 0, totalLeaves = 0;
    const leaveDetails = balance.map(item => {
      totalBalance += item.balance;
      totalLeaves += (item.balance + item.used);
      return {
        leave_type: item.leave_type,
        total: item.balance + item.used,
        balance: item.balance,
        used: item.used
      };
    });

    res.json({ totalBalance, totalLeaves, leaveDetails });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
};

const fetchLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await getLeaveTypes();
    if (!leaveTypes || leaveTypes.length === 0) {
      return res.status(404).json({ error: 'No leave types found.' });
    }
    res.json(leaveTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave types' });
  }
};

const requestLeaveHandler = async (req, res) => {
  try {
    const { userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason } = req.body;

    const result = await requestLeave(userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason);

    res.status(201).json({ message: 'Leave requested successfully', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getLeaveHistoryHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const leaveHistory = await getLeaveHistory(userId);
    res.status(200).json({ leaveHistory });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelLeaveHandler = async (req, res) => {
  try {
    const { leaveRequestId } = req.params;
    const result = await cancelLeave(leaveRequestId);
    res.status(200).json({ message: 'Leave canceled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getIncomingRequestsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await getIncomingRequests(userId);
    res.status(200).json({ incomingRequests: requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
};

const approveLeaveHandler = async (req, res) => {
  try {
    const requestId = req.params.approveId;
    const result = await approveLeave(requestId);
    res.status(200).json({ message: 'Leave approval processed', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve leave' });
  }
};

const rejectLeaveHandler = async (req, res) => {
  try {
    const {rejectId} = req.params;
    const result = await rejectLeave(rejectId);
    res.status(200).json({ message: 'Leave rejected', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject leave' });
  }
};

const createLeaveHandler = async (req, res) => {
  try {
    const {name,max_days,multi_approver}= req.body;
    const result = await addLeaveType(name,max_days,multi_approver);
    res.status(200).json({ message: 'Leave type added successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add leave type' });
  }
};

const updateLeaveHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {name, max_per_year, multi_approver} = req.body
    const result = await updateLeaveType(id,name, max_per_year, multi_approver);
    res.status(200).json({ message: 'Leave type updated successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leave type' });
  }
};

const deleteLeaveHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteLeaveType(id);
    res.status(200).json({ message: 'Leave type deleted successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete leave type' });
  }
};

module.exports = {
  fetchUsersOnLeaveToday,
  approveLeaveHandler,
  rejectLeaveHandler,
  fetchLeaveBalance,
  fetchLeaveTypes,
  requestLeaveHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler,
  createLeaveHandler,
  updateLeaveHandler,
  deleteLeaveHandler
};