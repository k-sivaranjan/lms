import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from "../utils/api";
import '../styles/admin.css';

function Admin({ user}) {

  const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [leaveUsers, setLeaveUsers] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUsersOnLeaveToday();
      fetchAllUsers();
    }
  }, [user]);

  const fetchUsersOnLeaveToday = async () => {
    const res = await api.get('/leave/on-leave-today');
    if (!res.data) {
      setUsersOnLeaveToday([]);
      setLeaveUsers(0);
    } else {
      setUsersOnLeaveToday(res.data.users);
      setLeaveUsers(res.data.count);
    }
  };

  const fetchAllUsers = async () => {
    const res = await api.get('/auth/users');
    
    setTotalUsers(res.data.data.count);
  };

  return (
    <>
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
                minAngle={1}
                label={({percent }) => `${(percent * 100).toFixed(1)}%`}
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
    </>
  );
}

  export default Admin;