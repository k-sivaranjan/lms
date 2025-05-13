const {
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
} = require('../models/leaveModel');

// Fetch users who are on leave today
const fetchUsersOnLeaveToday = async (req, res) => {
  try {
    const users = await getUsersOnLeaveToday();
    if (users.length === 0) {
      return res.status(204).json({ message: 'No users are on leave today.' });
    }
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Fetch users on leave error:', error);
    res.status(500).json({ error: 'Failed to fetch users on leave today' });
  }
};

// Fetch team members with their respective leave Details
const fetchTeamLeave = async (req, res) => {
  try {
    const { teamMembers, month, year } = req.query;
    
    if (!teamMembers || !month || !year) {
      return res.status(400).json({ error: 'Missing teamMembers, month, or year' });
    }

    const userIdArray = teamMembers.split(',').map(id => parseInt(id.trim()));

    const leaveRequests = await getTeamLeave(userIdArray, month, year);
    
    res.json({ leaveRequests });
  } catch (error) {
    console.error('Error fetching team leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

// Fetch user's leave balance
const fetchLeaveBalance = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
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
        leave_type: item.leaveType.name,
        total: item.balance + item.used,
        balance: item.balance,
        used: item.used
      };
    });

    res.json({ totalBalance, totalLeaves, leaveDetails });
  } catch (error) {
    console.error('Fetch leave balance error:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
};

// Fetch all available leave types
const fetchLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await getLeaveTypes();
    if (!leaveTypes || leaveTypes.length === 0) {
      return res.status(404).json({ error: 'No leave types found.' });
    }
    res.json(leaveTypes);
  } catch (error) {
    console.error('Fetch leave types error:', error);
    res.status(500).json({ error: 'Failed to fetch leave types' });
  }
};

// Request a leave
const requestLeaveHandler = async (req, res) => {
  try {
    const { userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason,totalDays } = req.body;

    const result = await requestLeave(
      userId, 
      leaveTypeId, 
      startDate, 
      endDate, 
      isHalfDay, 
      halfDayType, 
      reason,
      totalDays
    );

    res.status(201).json({ message: 'Leave requested successfully', result });
  } catch (err) {
    console.error('Request leave error:', err);
    res.status(400).json({ error: err instanceof Error ? err.message : 'An error occurred' });
  }
};

// Get leave history
const getLeaveHistoryHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const leaveHistory = await getLeaveHistory(userId);
    res.status(200).json({ leaveHistory });
  } catch (err) {
    console.error('Get leave history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel a leave request
const cancelLeaveHandler = async (req, res) => {
  try {
    const leaveRequestId = parseInt(req.params.leaveRequestId);
    const result = await cancelLeave(leaveRequestId);
    res.status(200).json({ message: 'Leave canceled successfully' });
  } catch (err) {
    console.error('Cancel leave error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get incoming leave requests for approval
const getIncomingRequestsHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requests = await getIncomingRequests(userId);
    res.status(200).json({ incomingRequests: requests });
  } catch (err) {
    console.error('Get incoming requests error:', err);
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
};

// Approve a leave request
const approveLeaveHandler = async (req, res) => {
  try {
    const requestId = parseInt(req.params.approveId);
    const result = await approveLeave(requestId);
    res.status(200).json({ message: 'Leave approval processed', result });
  } catch (err) {
    console.error('Approve leave error:', err);
    res.status(500).json({ error: 'Failed to approve leave' });
  }
};

// Reject a leave request
const rejectLeaveHandler = async (req, res) => {
  try {
    const rejectId = parseInt(req.params.rejectId);
    const result = await rejectLeave(rejectId);
    res.status(200).json({ message: 'Leave rejected', result });
  } catch (err) {
    console.error('Reject leave error:', err);
    res.status(500).json({ error: 'Failed to reject leave' });
  }
};

// Create a new leave type
const createLeaveHandler = async (req, res) => {
  try {
    const { name, maxPerYear, multiApprover } = req.body;
    const result = await addLeaveType(name, maxPerYear, multiApprover);
    res.status(200).json({ message: 'Leave type added successfully', result });
  } catch (err) {
    console.error('Create leave type error:', err);
    res.status(500).json({ error: 'Failed to add leave type' });
  }
};

// Update an existing leave type
const updateLeaveHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, maxPerYear, multiApprover } = req.body;
    const result = await updateLeaveType(id, name, maxPerYear, multiApprover);
    res.status(200).json({ message: 'Leave type updated successfully', result });
  } catch (err) {
    console.error('Update leave type error:', err);
    res.status(500).json({ error: 'Failed to update leave type' });
  }
};

// Delete a leave type
const deleteLeaveHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteLeaveType(id);
    res.status(200).json({ message: 'Leave type deleted successfully', result });
  } catch (err) {
    console.error('Delete leave type error:', err);
    res.status(500).json({ error: 'Failed to delete leave type' });
  }
};

module.exports = {
  fetchUsersOnLeaveToday,
  fetchTeamLeave,
  fetchLeaveBalance,
  fetchLeaveTypes,
  requestLeaveHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler,
  approveLeaveHandler,
  rejectLeaveHandler,
  createLeaveHandler,
  updateLeaveHandler,
  deleteLeaveHandler
};