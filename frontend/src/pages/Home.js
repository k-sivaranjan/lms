import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../userContext';
import Admin from './Admin';
import api from "../api";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import '../styles/home.css';

const COLORS = ['#0088FE', '#FF8042'];
const MAX_BAR_HEIGHT = 20

function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [leaveTotal, setLeaveTotal] = useState(0);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, [user, navigate]);

  const fetchBalance = async () => {
    if (!user || user.role.name === "admin") return;
    try {
      const res = await api.get(`/leave/balance/${user.id}`);
      setLeaveTotal(res.data.totalLeaves);
      setLeaveBalance(res.data.totalBalance);
      setLeaveDetails(res.data.leaveDetails);
    } catch {
      setError('Error fetching leave balance');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (user.role.name === "admin") {
    return <Admin user={user} />;
  }

  const hasOnlyUnlimitedLeaves = leaveDetails.every(detail => detail.maxPerYear === null);

  let pieData;
  if (hasOnlyUnlimitedLeaves) {
    pieData = [
      { name: 'Used', value: leaveTotal - leaveBalance },
      { name: 'Balance', value: 100 }
    ];
  } else {
    pieData = [
      { name: 'Used', value: leaveTotal - leaveBalance },
      { name: 'Balance', value: leaveBalance }
    ];
  }

  const barData = leaveDetails.map(detail => ({
    name: detail.leave_type,
    Total: detail.maxPerYear === null ? MAX_BAR_HEIGHT : detail.maxPerYear,
    Used: detail.used,
    Balance: detail.maxPerYear === null ? MAX_BAR_HEIGHT : detail.balance
  }));

  return (
    <div className="leave-balance">
      {loading ? (
        <p>Loading leave balance...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <p><strong>Total Balance Leaves:</strong> {leaveBalance}</p>
          <div className="charts-container">
            <div className="chart-box">
              <h4>Total vs Used Leaves</h4>
              <ResponsiveContainer width={210} height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" label outerRadius={60} dataKey="value">
                    {pieData.map((entry, index) =>
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    )}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => value === 100 ? '∞' : value}
                  />

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
                  <RechartsTooltip formatter={(value, name) => {
                    if ((name === 'Total' || name === 'Balance') && value === MAX_BAR_HEIGHT) return ['∞', name];
                    return [value, name];
                  }} />
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
      )}
    </div>
  );
}

export default Home;
