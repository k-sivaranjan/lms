import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import { Toast } from "./Toast"
import api from "../utils/api";
import '../styles/history.css';
import '../styles/loader.css';

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

  useEffect(() => {
    fetchRequestHistory();
  }, [user]);

  const fetchRequestHistory = async () => {
    if (!user || user.role.name === "employee") {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/leave/requests/history/${user.id}`);
      setRequestHistory(res.data.requestsHistory);
    } catch {
      Toast.error('Error fetching team leave request history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, '0');
    return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="dot-spinner">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>

    );
  }

  if (!requestHistory.length) {
    return (
      <div className="no-requests">
        <h3>No Team History</h3>
        <p>There are no team leave history records at the moment.</p>
      </div>
    );
  }

  return (
    <div className="leave-history-container">
      <h3>Team Leave Requests History</h3>
      <div className="scrollable-table">
        <table className="leave-history-table">
          <thead>
            <tr>
              <th>Requested By</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Action Taken On</th>
            </tr>
          </thead>
          <tbody>
            {requestHistory.map(req => (
              <tr key={req.id}>
                <td>{req.employee_name}</td>
                <td>{req.leave_type}</td>
                <td>{formatDate(req.start_date)}</td>
                <td>{formatDate(req.end_date)}</td>
                <td>{statusMap[req.status]}</td>
                <td>{formatDateTime(req.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestsHistory;