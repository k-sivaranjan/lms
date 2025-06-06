import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../utils/userContext';
import Admin from './Admin';
import api from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, Legend,
  ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import '../styles/home.css';
import '../styles/loader.css';

function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [leaveBalance, setLeaveBalance] = useState(0);
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

  const MAX_BAR_HEIGHT = 20
  const barData = leaveDetails.map(detail => {
    const total = detail.balance + detail.used;
    const balance = detail.balance;
    const used = detail.used;
    const max = detail.maxPerYear;
    const exceededMaxBar = used >= MAX_BAR_HEIGHT;

    return {
      name: detail.leave_type,
      Total: (max === null || max == 0) ? exceededMaxBar ? used : MAX_BAR_HEIGHT : total,
      Used: used,
      Balance: (max === null || max == 0) ? exceededMaxBar ? used : MAX_BAR_HEIGHT : balance,
      Used: used,
    };
  });

  return (
    <div className="leave-balance">
      {loading ? (
        <div className="spinner-container">
          <div className="dot-spinner">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <p><strong>Total Balance Leaves:</strong> {leaveBalance}</p>
          <div className="charts-container">
            <div className="chart-box">
              <h4>Leave Type-wise Usage</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" interval={0} />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value, name, props) => {
                      const leaveType = props.payload.name;
                      const unlimitedLeaveTypes = ['Loss of Pay'];

                      if ((name === 'Total' || name === 'Balance') && unlimitedLeaveTypes.includes(leaveType)) {
                        return ['∞', name];
                      }
                      return [value, name];
                    }}
                  />

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
