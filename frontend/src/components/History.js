import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function History() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaveHistory();
  }, [user]);

  const fetchLeaveHistory = async () => {
    try {
      const res = await api.get(`/leave/history/${user.id}`);
      setLeaveHistory(res.data.leaveHistory);
    } catch {
      setError(prev => ({ ...prev, history: 'Error fetching leave history' }));
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave?')) return;

    try {
      await api.put(`/leave/cancel/${leaveId}`);
      alert('Leave cancelled');
      closeModal();
      fetchLeaveHistory(); // Refresh after cancel
    } catch (err) {
      console.error('Failed to cancel leave:', err);
      alert('Failed to cancel leave');
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const openModal = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLeave(null);
  };

  const sortedHistory = [...leaveHistory].sort((a, b) => {
    return a.status - b.status || new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="leave-history-container">

      {leaveHistory.length === 0 ? (
        <div className="no-requests">
          <h3>No Leave History</h3>
          <p>You haven't made any leave requests yet.</p>
        </div>
      ) : (
        <table className="leave-history-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.leave_type}</td>
                <td>{formatDate(leave.start_date)}</td>
                <td>{formatDate(leave.end_date)}</td>
                <td>{statusMap[leave.status] || "Unknown"}</td>
                <td>
                  <button onClick={() => openModal(leave)} className="view-button">View Request</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedLeave && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Leave Request Details</h4>
            <p><strong>Leave Type:</strong> {selectedLeave.leave_type}</p>
            <p><strong>From:</strong> {formatDate(selectedLeave.start_date)}</p>
            <p><strong>To:</strong> {formatDate(selectedLeave.end_date)}</p>
            <p><strong>Status:</strong> {statusMap[selectedLeave.status]}</p>
            <p><strong>Reason:</strong> {selectedLeave.reason || 'N/A'}</p>
            <p><strong>Manager:</strong> {selectedLeave.manager_name || 'N/A'}</p>

            {(selectedLeave.status !== 7 && selectedLeave.status !== 6 &&
              new Date(selectedLeave.start_date) > new Date()) && (
                <button onClick={() => handleCancel(selectedLeave.id)} className="cancel-button">
                  Cancel Leave
                </button>
              )}

            <button onClick={closeModal} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;