import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../userContext';
import LeaveHistory from '../components/LeaveHistory';
import Admin from './Admin';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/home.css';

const COLORS = ['#0088FE', '#FF8042'];

function Home() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [leaveTotal, setLeaveTotal] = useState(0);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [loading, setLoading] = useState({ history: true, balance: true, incoming: true });
  const [error, setError] = useState({ history: null, balance: null, incoming: null });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/leave/history/${user.id}`);
        setLeaveHistory(res.data.leaveHistory);
      } catch {
        setError(prev => ({ ...prev, history: 'Error fetching leave history' }));
      } finally {
        setLoading(prev => ({ ...prev, history: false }));
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (!user || user.role === "admin") return;
    const fetchBalance = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/leave/balance/${user.id}`);
        setLeaveTotal(res.data.totalLeaves);
        setLeaveBalance(res.data.totalBalance);
        setLeaveDetails(res.data.leaveDetails);
      } catch {
        setError(prev => ({ ...prev, balance: 'Error fetching leave balance' }));
      } finally {
        setLoading(prev => ({ ...prev, balance: false }));
      }
    };
    fetchBalance();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchIncomingRequests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/leave/requests/${user.id}`);
        setIncomingRequests(res.data.incomingRequests);
      } catch {
        setError(prev => ({ ...prev, incoming: 'Error fetching incoming requests' }));
      } finally {
        setLoading(prev => ({ ...prev, incoming: false }));
      }
    };
    fetchIncomingRequests();
  }, [user]);

  const handleRequestLeave = () => navigate('/request-leave');

  const handleApproveReject = async (requestId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/leave/${action}/${requestId}`);
      alert(`Request ${action}ed successfully`);
      setIncomingRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: action } : req));
    } catch {
      alert(`Failed to ${action} request`);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (!user) return null;
  if (user.role === "admin") return <Admin user={user} logout={logout} />;

  const pieData = [
    { name: 'Used', value: leaveTotal - leaveBalance },
    { name: 'Balance', value: leaveBalance }
  ];

  const barData = leaveDetails.map(detail => ({
    name: detail.leave_type,
    Total: detail.total,
    Used: detail.used,
    Balance: detail.balance
  }));

  return (
    <div className="employee-home">
      <div className="home-header">
        <h2 className="welcome-message">Welcome, {user.name}</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="leave-balance">
        {loading.balance ? <p>Loading leave balance...</p> :
          error.balance ? <p>{error.balance}</p> :
            <>
              <p><strong>Total Balance Leaves:</strong> {leaveBalance}</p>
              <div className="charts-container">
                <div className="chart-box">
                  <h4>Total vs Used Leaves</h4>
                  <ResponsiveContainer width={210} height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" label outerRadius={60} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-box">
                  <h4>Leave Type-wise Usage</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" interval={0} />
                      <YAxis />
                      <Legend />
                      <RechartsTooltip />
                      <Bar dataKey="Total" fill="#8884d8" />
                      <Bar dataKey="Used" fill="#FF8042" />
                      <Bar dataKey="Balance" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
        }
        <button onClick={handleRequestLeave} className="request-leave-button">Request Leave</button>
      </div>

      {incomingRequests.length > 0 && (
        <div className="incoming-requests">
          <h3>Leave Requests for Approval</h3>
          <div className="scrollable-table">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomingRequests.map(req => (
                  <tr key={req.id}>
                    <td>{req.employee_name}</td>
                    <td>{req.leave_type}</td>
                    <td>{formatDate(req.start_date)}</td>
                    <td>{formatDate(req.end_date)}</td>
                    <td>{req.status}</td>
                    <td>
                      {['Pending', 'Pending (L1)', 'Pending (L2)', 'Pending (L2)'].includes(req.status) ? (
                        <>
                          <button className='approve-btn' onClick={() => handleApproveReject(req.id, 'approve')}>Approve</button>
                          <button className='approve-btn reject-btn' onClick={() => handleApproveReject(req.id, 'reject')}>Reject</button>
                        </>
                      ) : 'No actions'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="leave-history">
        {loading.history ? <p>Loading leave history...</p> :
          error.history ? <p>{error.history}</p> :
            <LeaveHistory leaveHistory={leaveHistory}/>
        }
      </div>
    </div>
  );
}

export default Home;