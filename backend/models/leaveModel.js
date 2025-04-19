const pool = require('../config/db');

const getUsersOnLeaveToday = async () => {
  const query = `
    SELECT 
      u.id, u.name, u.email,
      GROUP_CONCAT(DISTINCT lr.start_date ORDER BY lr.start_date) AS start_dates,
      GROUP_CONCAT(DISTINCT lr.end_date ORDER BY lr.end_date) AS end_dates,
      GROUP_CONCAT(DISTINCT lt.name ORDER BY lr.start_date) AS leave_types
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.status = 'approved'
      AND CURDATE() BETWEEN lr.start_date AND lr.end_date
    GROUP BY u.id, u.name, u.email
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getLeaveBalance = async (userId, year) => {
  const query = `
    SELECT 
      lb.leave_type_id, 
      lt.name AS leave_type,
      lb.balance, 
      lb.used
    FROM leave_balances lb
    JOIN leave_types lt ON lb.leave_type_id = lt.id
    WHERE lb.user_id = ? AND lb.year = ?
  `;
  const [rows] = await pool.execute(query, [userId, year]);
  return rows;
};


const getLeaveTypes = async () => {
  const query = `SELECT * FROM leave_types`
  const [leaveTypes] = await pool.execute(query);
  return leaveTypes;
};

// const requestLeave = async (userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason) => {
//   const query = `
//     INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, is_half_day, half_day_type, reason, status, created_at)
//     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
//   `;
//   const [result] = await pool.execute(query, [userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType || null , reason || null]);
//   return result;
// };
const requestLeave = async (userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason) => {
  // Calculate leave days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Fetch leave type to check if multi-approver is required
  const [leaveTypeRows] = await pool.execute(
    `SELECT multi_approver FROM leave_types WHERE id = ?`,
    [leaveTypeId]
  );
  const multiApprover = leaveTypeRows[0]?.multi_approver;

  // Fetch user's manager (1st-level approver)
  const [userRows] = await pool.execute(
    `SELECT manager_id FROM users WHERE id = ?`,
    [userId]
  );
  const { manager_id } = userRows[0];

  // You can fetch 2nd-level manager now if needed for routing during approval
  let level2ApproverId = null;
  if (manager_id) {
    const [managerRows] = await pool.execute(
      `SELECT manager_id FROM users WHERE id = ?`,
      [manager_id]
    );
    level2ApproverId = managerRows[0]?.manager_id;
    // Don't store this in DB now — just for your own logic flow later.
  }

  // Decide initial status
  const initialStatus =
    leaveDays > 5 || multiApprover === 1 ? 'pending_level_1' : 'pending';

  // Insert leave request
  const query = `
    INSERT INTO leave_requests 
    (user_id, leave_type_id, start_date, end_date, is_half_day, half_day_type, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const [result] = await pool.execute(query, [
    userId,
    leaveTypeId,
    startDate,
    endDate,
    isHalfDay,
    halfDayType || null,
    reason || null,
    initialStatus,
  ]);

  return result;
};


const getLeaveHistory = async (userId) => {
  const query = `
    SELECT 
      lr.id,
      lt.name AS leave_type,
      lr.start_date,
      lr.end_date,
      lr.reason,
      lr.status,
      manager.name AS manager_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    JOIN users requester ON lr.user_id = requester.id
    LEFT JOIN users manager ON requester.manager_id = manager.id
    WHERE lr.user_id = ?
    ORDER BY lr.created_at DESC
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

// const cancelLeave = async (leaveRequestId) => {
//   const query = 'UPDATE leave_requests SET status = "cancelled" WHERE id = ?';
//   const [result] = await pool.execute(query, [leaveRequestId]);
//   return result;
// };
const cancelLeave = async (leaveRequestId) => {
  // First, fetch the leave request details to check its current status and approvers
  const [leaveRequest] = await pool.execute('SELECT * FROM leave_requests WHERE id = ?', [leaveRequestId]);
  if (leaveRequest.length === 0) {
    throw new Error('Leave request not found');
  }

  const request = leaveRequest[0];
  const { status, level_2_approver_id } = request;

  // Check if the leave request is either in 'pending_level_1' or 'pending_level_2' status
  if (status === 'pending_level_1' || status === 'pending_level_2') {
    // Proceed to cancel the leave request
    const cancelQuery = 'UPDATE leave_requests SET status = "cancelled" WHERE id = ?';
    const [result] = await pool.execute(cancelQuery, [leaveRequestId]);

    return result;
  } else {
    // Handle cases where the leave request is not in a cancellable state (e.g., already approved or rejected)
    throw new Error('Leave request cannot be cancelled because it is not pending');
  }
};

const getIncomingRequests = async (userId) => {
  const [userRows] = await pool.execute(`SELECT role FROM users WHERE id = ?`, [userId]);
  const role = userRows[0]?.role;

  if (!role) return [];

  if (role === 'admin') {
    const [adminRequests] = await pool.execute(`
      SELECT 
        lr.*, 
        u.name AS employee_name,
        lt.name AS leave_type
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users mgr ON u.manager_id = mgr.id
      WHERE 
        (lr.status = 'pending' AND u.role = 'manager') OR
        (lr.status = 'pending_level_2' AND mgr.manager_id = ?)
    `, [userId]);

    return adminRequests;
  }

  if (role === 'manager') {
    const [managerRequests] = await pool.execute(`
      SELECT 
        lr.*, 
        u.name AS employee_name,
        lt.name AS leave_type
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.status = 'pending_level_1' AND u.manager_id = ?
    `, [userId]);

    return managerRequests;
  }

  return [];
};



// const approveLeave = async (requestId) => {
//   // First, fetch the request details
//   const [requestRows] = await pool.execute(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
//   const request = requestRows[0];
//   if (!request) throw new Error('Leave request not found');

//   // Calculate the number of leave days
//   const start = new Date(request.start_date);
//   const end = new Date(request.end_date);
//   const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

//   // Update leave request status
//   await pool.execute(`UPDATE leave_requests SET status = 'approved' WHERE id = ?`, [requestId]);
//   // Deduct leave from user's balance
//   await pool.execute(`UPDATE leave_balances SET used = used + ?, balance = balance - ? WHERE user_id = ? AND leave_type_id = ?`, [leaveDays, leaveDays, request.user_id, request.leave_type_id]);
//   return { approved: true };
// };
const approveLeave = async (requestId) => {
  // Fetch request details
  const [requestRows] = await pool.execute(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
  const request = requestRows[0];
  if (!request) throw new Error('Leave request not found');

  const { user_id, leave_type_id, start_date, end_date, status } = request;

  const start = new Date(start_date);
  const end = new Date(end_date);
  const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Get leave type to check for multi-approver requirement
  const [leaveTypeRows] = await pool.execute(`SELECT multi_approver FROM leave_types WHERE id = ?`, [leave_type_id]);
  const multiApprover = leaveTypeRows[0]?.multi_approver;

  // Approval flow logic
  if (status === 'pending') {
    // Direct single-level approval
    await pool.execute(`UPDATE leave_requests SET status = 'approved' WHERE id = ?`, [requestId]);
  } else if (status === 'pending_level_1') {
    if (leaveDays > 5 || multiApprover === 1) {
      // Needs second level approval
      await pool.execute(`UPDATE leave_requests SET status = 'pending_level_2' WHERE id = ?`, [requestId]);
      return { nextStep: 'Moved to level 2 approval' };
    } else {
      // Can be approved directly
      await pool.execute(`UPDATE leave_requests SET status = 'approved' WHERE id = ?`, [requestId]);
    }
  } else if (status === 'pending_level_2') {
    await pool.execute(`UPDATE leave_requests SET status = 'approved' WHERE id = ?`, [requestId]);
  } else {
    throw new Error('Invalid leave status or already processed');
  }

  // Only deduct leave when fully approved
  const [[updatedRequest]] = await pool.execute(`SELECT status FROM leave_requests WHERE id = ?`, [requestId]);
  if (updatedRequest.status === 'approved') {
    await pool.execute(`
      UPDATE leave_balances 
      SET used = used + ?, balance = balance - ? 
      WHERE user_id = ? AND leave_type_id = ?
    `, [leaveDays, leaveDays, user_id, leave_type_id]);
  }

  return { approved: true };
};

const rejectLeave = async (requestId) => {
  const [result] = await pool.execute(
    `UPDATE leave_requests SET status = 'rejected' WHERE id = ?`,
    [requestId]
  );
  return result;
};

module.exports = { getUsersOnLeaveToday, rejectLeave, approveLeave, getLeaveBalance, getLeaveTypes, requestLeave, getLeaveHistory, cancelLeave, getIncomingRequests };