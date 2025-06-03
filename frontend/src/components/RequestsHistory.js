import React, { useState, useEffect } from 'react';
import { useUser } from '../userContext';
import api from "../api";
import '../styles/history.css';

const statusMap = {
  1: "Pending",
  2: "Pending (L1)",
  3: "Pending (L2)",
  4: "Pending (L3)",
  5: "Approved",
  6: "Rejected",
  7: "Cancelled"
};

function RequestsHistory() {
  const [requestHistory, setRequestHistory] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequestHistory();
  }, [user]);

  const fetchRequestHistory = async () => {
    if (!user || user.role.name === "employee") return;
    try {
      const res = await api.get(`/leave/requests/history/${user.id}`);
      setRequestHistory(res.data.requestsHistory);
    } catch {
      setError('Error fetching incoming requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  if (!requestHistory.length) {
    return (
      <div className="no-requests">
        <h3>No Team History</h3>
        <p>There are no team history available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="leave-history-container">
      <h3>Leave Requests for Approval</h3>
      <div className="scrollable-table">
        <table className="leave-history-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {requestHistory.map(req => (
              <tr key={req.id}>
                <td>{req.employee_name}</td>
                <td>{req.leave_type}</td>
                <td>{formatDate(req.start_date)}</td>
                <td>{formatDate(req.end_date)}</td>
                <td>{req.status}</td>
                <td>{formatDate(req.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsHistory;
