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

  const leaveDays = isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const [leaveBalanceRows] = await pool.execute(
    `SELECT balance, used FROM leave_balances WHERE user_id = ? AND leave_type_id = ?`,
    [userId, leaveTypeId]
  );

  const leaveBalance = leaveBalanceRows[0];
  
  if (!leaveBalance) {
    throw new Error('Leave balance not found for the user or leave type');
  }

  const totalUsedLeave = leaveBalance.used;
  const maxLeaveDays = leaveBalance.balance + leaveBalance.used;

  if (totalUsedLeave + leaveDays > maxLeaveDays) {
    throw new Error(`You have exceeded the maximum allowed leave days for this leave type. Max allowed: ${maxLeaveDays} days.`);
  }

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

  const maxApproverByRole = role === 'employee' ? 3 : role === 'manager' ? 2 : 1;

  const finalApprovalLevel = leaveDays >= 5 ? maxApproverByRole : Math.min(multiApprover, maxApproverByRole);

  let level2ApproverId = null;
  if (manager_id) {
    const [managerRows] = await pool.execute(
      `SELECT manager_id FROM users WHERE id = ?`,
      [manager_id]
    );
    level2ApproverId = managerRows[0]?.manager_id;
  }

  let level3ApproverId = null;
  if (level2ApproverId) {
    const [hrRows] = await pool.execute(
      `SELECT manager_id FROM users WHERE id = ?`,
      [level2ApproverId]
    );
    level3ApproverId = hrRows[0]?.manager_id;
  }

  const initialStatus = finalApprovalLevel > 1 ? 'Pending (L1)' : 'Pending';

  const query = `
    INSERT INTO leave_requests 
    (user_id, leave_type_id, start_date, end_date, is_half_day, half_day_type, reason, status, final_approval_level, total_days, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
    finalApprovalLevel,
    leaveDays
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

  const { user_id, leave_type_id, status, total_days, final_approval_level } = request;

  if (total_days === null) {
    throw new Error('Total days not calculated');
  }

  let leaveDays = total_days;

  if (status === 'Pending') {
    await pool.execute(`UPDATE leave_requests SET status = 'Approved' WHERE id = ?`, [requestId]);

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
    if (final_approval_level === 3) {
      await pool.execute(`UPDATE leave_requests SET status = 'Pending (L3)' WHERE id = ?`, [requestId]);
      return { nextStep: 'Approved (L3)' };
    } else {
      await pool.execute(`UPDATE leave_requests SET status = 'Approved' WHERE id = ?`, [requestId]);

      await pool.execute(`
        UPDATE leave_balances 
        SET used = used + ?, balance = balance - ? 
        WHERE user_id = ? AND leave_type_id = ?`,
        [leaveDays, leaveDays, user_id, leave_type_id]);

      return { nextStep: 'Approved' };
    }
  }

  else if (status === 'Pending (L3)') {
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

const rejectLeave = async (requestId) => {
  const [requestRows] = await pool.execute(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
  const request = requestRows[0];
  if (!request) throw new Error('Leave request not found');

  await pool.execute(
    `UPDATE leave_requests 
     SET status = 'Rejected'
     WHERE id = ?`,
    [requestId]
  );

  return { success: true, message: 'Leave request rejected successfully' };
};

const addLeaveType = async (name, max_per_year, multiApprover = 1) => {
  const query = `
    INSERT INTO leave_types (name, max_per_year, multi_approver)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.execute(query, [name, max_per_year, multiApprover]);
  return result;
};

const updateLeaveType = async (leaveTypeId, name, max_per_year, multiApprover = 1) => {
  const query = `
    UPDATE leave_types
    SET name = ?, max_per_year = ?, multi_approver = ?
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [name, max_per_year, multiApprover, leaveTypeId]);
  return result;
};

const deleteLeaveType = async (leaveTypeId) => {
  const query = `DELETE FROM leave_types WHERE id = ?`;
  const [result] = await pool.execute(query, [leaveTypeId]);
  return result;
};

module.exports = {
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
};
