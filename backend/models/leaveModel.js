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
    WHERE lr.status = 'Approved'
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
  const query = `SELECT * FROM leave_types`;
  const [leaveTypes] = await pool.execute(query);
  return leaveTypes;
};

const requestLeave = async (
  userId,
  leaveTypeId,
  startDate,
  endDate,
  isHalfDay,
  halfDayType,
  reason
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const [leaveTypeRows] = await pool.execute(
    `SELECT multi_approver FROM leave_types WHERE id = ?`,
    [leaveTypeId]
  );
  const multiApprover = leaveTypeRows[0]?.multi_approver || 1;

  const [userRows] = await pool.execute(
    `SELECT role, manager_id FROM users WHERE id = ?`,
    [userId]
  );
  const { role, manager_id } = userRows[0];

  let maxApproverByRole = 1;
  if (role === 'employee') maxApproverByRole = 3;
  else if (role === 'manager') maxApproverByRole = 2;

  const finalApprovalLevel = Math.min(multiApprover, maxApproverByRole);

  let level2ApproverId = null;
  if (manager_id) {
    const [managerRows] = await pool.execute(
      `SELECT manager_id FROM users WHERE id = ?`,
      [manager_id]
    );
    level2ApproverId = managerRows[0]?.manager_id;
  }

  let initialStatus = 'Pending';
  if (finalApprovalLevel > 1) initialStatus = 'Pending (L1)';

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

const cancelLeave = async (leaveRequestId) => {
  const [leaveRequest] = await pool.execute(
    'SELECT * FROM leave_requests WHERE id = ?',
    [leaveRequestId]
  );

  if (leaveRequest.length === 0) {
    throw new Error('Leave request not found');
  }

  const request = leaveRequest[0];
  const { status, user_id, leave_type_id, start_date, end_date, is_half_day } = request;

  const start = new Date(start_date);
  const end = new Date(end_date);
  let totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;
  if (is_half_day) totalDays = 0.5;

  await pool.execute('UPDATE leave_requests SET status = "cancelled" WHERE id = ?', [leaveRequestId]);

  if (status === 'Approved') {
    const leaveTypesOnlyUsed = [9, 10];

    if (leaveTypesOnlyUsed.includes(leave_type_id)) {
      await pool.execute(
        `UPDATE leave_balances
         SET used = used - ?
         WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(?)`,
        [totalDays, user_id, leave_type_id, start_date]
      );
    } else {
      await pool.execute(
        `UPDATE leave_balances
         SET balance = balance + ?, used = used - ?
         WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(?)`,
        [totalDays, totalDays, user_id, leave_type_id, start_date]
      );
    }
  }
  
  return { success: true, message: 'Leave request cancelled successfully' };
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
      LEFT JOIN users hr ON mgr.manager_id = hr.id        
      WHERE 
        (lr.status = 'Pending' AND u.role = 'hr') OR
        (lr.status = 'Pending (L2)' AND hr.manager_id = ?) OR  
        (lr.status = 'Pending (L3)' AND hr.manager_id = ?)
    `, [userId, userId]);

    return adminRequests;
  }

  if (role === 'hr') {
    const [hrRequests] = await pool.execute(`
      SELECT 
        lr.*, 
        u.name AS employee_name,
        lt.name AS leave_type
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users mgr ON u.manager_id = mgr.id
      WHERE 
        (lr.status = 'Pending' AND u.manager_id = ?) OR
        (lr.status = 'Pending (L1)' AND u.manager_id = ?) OR
        (lr.status = 'Pending (L2)' AND mgr.manager_id = ?)
    `, [userId, userId, userId]);
    return hrRequests;
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
      WHERE (lr.status = 'Pending' AND u.manager_id = ?) OR
      (lr.status = 'Pending (L1)' AND u.manager_id = ?)
    `, [userId, userId]);

    return managerRequests;
  }

  return [];
};

const approveLeave = async (requestId) => {
  const [requestRows] = await pool.execute(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
  const request = requestRows[0];
  if (!request) throw new Error('Leave request not found');

  const { user_id, leave_type_id, start_date, end_date, is_half_day, status } = request;

  let leaveDays;
  if (is_half_day) {
    leaveDays = 0.5;
  } else {
    const start = new Date(start_date);
    const end = new Date(end_date);
    leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  const [leaveTypeRows] = await pool.execute(`SELECT multi_approver FROM leave_types WHERE id = ?`, [leave_type_id]);
  const multiApprover = leaveTypeRows[0]?.multi_approver;

  if (status === 'Pending') {
    await pool.execute(
      `UPDATE leave_requests SET status = 'Approved' WHERE id = ?`,
      [requestId]
    );
  
    if (leave_type_id === 9 || leave_type_id === 10) {
      await pool.execute(
        `UPDATE leave_balances 
         SET used = used + ? 
         WHERE user_id = ? AND leave_type_id = ?`,
        [leaveDays, user_id, leave_type_id]
      );
    } else {
      await pool.execute(
        `UPDATE leave_balances 
         SET used = used + ?, balance = balance - ? 
         WHERE user_id = ? AND leave_type_id = ?`,
        [leaveDays, leaveDays, user_id, leave_type_id]
      );
    }
  
    return { nextStep: 'Approved' };
  }
  
  else if (status === 'Pending (L1)') {
    await pool.execute(`UPDATE leave_requests SET status = 'Pending (L2)' WHERE id = ?`, [requestId]);
    return { nextStep: 'Approved (L2)' };
  }

  else if (status === 'Pending (L2)') {
    await pool.execute(`UPDATE leave_requests SET status = 'Approved' WHERE id = ?`, [requestId]);

    await pool.execute(`
      UPDATE leave_balances 
      SET used = used + ?, balance = balance - ? 
      WHERE user_id = ? AND leave_type_id = ?`,
      [leaveDays, leaveDays, user_id, leave_type_id]);

    return { nextStep: 'Approved' };
  }

  return { message: 'Leave request already processed' };
};

module.exports = {
  getUsersOnLeaveToday,
  getLeaveBalance,
  getLeaveTypes,
  requestLeave,
  getLeaveHistory,
  cancelLeave,
  getIncomingRequests,
  approveLeave
};
