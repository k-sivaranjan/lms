const pool = require('../config/db');

const createUser = async (name, email, password, role, managerId) => {
  try {
    const query = `
      INSERT INTO users (name, email, password, role, manager_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const [userResult] = await pool.execute(query, [name, email, password, role, managerId]);
    const userId = userResult.insertId;

    const leaveTypesQuery = 'SELECT * FROM leave_types';
    const [leaveTypes] = await pool.execute(leaveTypesQuery);

    const leaveBalanceQuery = `
      INSERT INTO leave_balances (user_id, leave_type_id, year, balance, used)
      VALUES (?, ?, YEAR(CURDATE()), ?, 0)
    `;
    const leaveBalancePromises = leaveTypes.map(leaveType =>
      pool.execute(leaveBalanceQuery, [userId, leaveType.id, leaveType.max_per_year])
    );

    await Promise.all(leaveBalancePromises);
    return userResult;
  } catch (err) {
    console.error("Error in createUser function:", err);
    throw err;
  }
};

const getUser = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await pool.execute(query, [email]);
  return rows[0];
};


const getAllUsers = async () => {
  const query = 'SELECT id, name, email, role FROM users';
  const [rows] = await pool.execute(query);
  return rows;
};

module.exports = { createUser, getUser, getAllUsers };
