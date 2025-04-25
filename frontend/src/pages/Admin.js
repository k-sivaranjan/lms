import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import LeavePolicy from '../components/LeavePolicy';
import '../styles/admin.css';

function Admin({ user, logout }) {
  const navigate = useNavigate();

  const [adminRequests, setAdminRequests] = useState([]);
  const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [leaveUsers, setLeaveUsers] = useState(0);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (user) {
      fetchAdminRequests();
      fetchUsersOnLeaveToday();
      fetchAllUsers();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onAddUser = () => {
    navigate("/add-user");
  };

  const fetchAdminRequests = async () => {
    const res = await axios.get(`http://localhost:5000/api/leave/requests/${user.id}`);
    setAdminRequests(res.data.incomingRequests);
  };

  const fetchUsersOnLeaveToday = async () => {
    const res = await axios.get('http://localhost:5000/api/leave/on-leave-today');
    if (!res.data) {
      setUsersOnLeaveToday([]);
      setLeaveUsers(0);
    } else {
      setUsersOnLeaveToday(res.data.users);
      setLeaveUsers(res.data.count);
    }
  };

  const fetchAllUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/auth/users');
    setAllUsers(res.data.users);
    setTotalUsers(res.data.count);
  };

  const handleApproveReject = async (requestId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/leave/${action}/${requestId}`);
      setAdminRequests(prevRequests =>
        prevRequests.map(req => req.id === requestId ? { ...req, status: action } : req)
      );
      alert(`Request ${action}ed successfully`);
    } catch (err) {
      alert(`Failed to ${action} request`);
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Welcome, Admin</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <button className="add-user-btn" onClick={onAddUser}>Add User</button>
      <section className="leave-summary-row">
        <div className="users-on-leave">
          <h3>Users on Leave Today</h3>
          {usersOnLeaveToday.length === 0 ? (
            <p>No one is on leave today</p>
          ) : (
            <ul>
              {usersOnLeaveToday.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="leave-summary-chart">
          <h3>Leave Summary</h3>
          {totalUsers > 0 ? (
            <PieChart width={300} height={250}>
              <Pie
                data={[
                  { name: 'On Leave', value: leaveUsers },
                  { name: 'Available', value: totalUsers - leaveUsers }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#ff6384" />
                <Cell fill="#36a2eb" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      </section>

      {adminRequests.length > 0 && (
        <section className="admin-requests">
          <h3>Leave Requests Needing Your Action</h3>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {adminRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.employee_name}</td>
                  <td>{req.leave_type}</td>
                  <td>{formatDate(req.start_date)}</td>
                  <td>{formatDate(req.end_date)}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === 'Pending' || req.status.includes('Pending (') ? (
                      <>
                        <button className="approve-btn" onClick={() => handleApproveReject(req.id, 'approve')}>Approve</button>
                        <button className="approve-btn reject-btn" onClick={() => handleApproveReject(req.id, 'reject')}>Reject</button>
                      </>
                    ) : (
                      'No actions'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="all-users">
        <h3>All Users</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map(user => {
              const isOnLeave = usersOnLeaveToday.some(u => u.id === user.id);
              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name} {<button className={`status-btn ${isOnLeave ? 'out' : 'in'}`}>
                    {isOnLeave ? 'Out' : 'In'}
                  </button>}</td>
                  <td>{user.role}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className='leave-policy'>
        <LeavePolicy />
      </section>
    </div>
  );
}

export default Admin;