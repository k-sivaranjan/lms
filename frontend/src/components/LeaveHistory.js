import React, { useState } from 'react';
import api from '../api';
import '../styles/history.css';

function LeaveHistory({ leaveHistory }) {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Function to handle cancellation of a leave request
  const handleCancel = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave?')) return;

    try {
      await api.put(`/leave/cancel/${leaveId}`);
      alert('Leave cancelled');
      closeModal();
    } catch (err) {
      console.error('Failed to cancel leave:', err);
      alert('Failed to cancel leave');
    }
  };

  // Helper function to format dates
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Helper function to format leave statuses
  const formatStatus = (status) => {
    const statusMap = {
      pending_level_1: 'Pending (L1)',
      pending_level_2: 'Pending (L2)',
      pending_level_3: 'Pending (L3)',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return statusMap[status] || status;
  };

  // Modal component for viewing leave details
  const openModal = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLeave(null);
  };

  // Sort leave requests based on status and creation date
  const sortedHistory = [...leaveHistory].sort((a, b) => {
    const statusOrder = {
      pending_level_1: 0,
      pending_level_2: 1,
      pending_level_3: 2,
      approved: 3,
      rejected: 4,
    };
    return statusOrder[a.status] - statusOrder[b.status] || new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="leave-history-container">
      <h3 className="leave-history-title">Previous Leave Requests</h3>

      {leaveHistory.length === 0 ? (
        <p>No leave history available.</p>
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
                <td>{formatStatus(leave.status)}</td>
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
            <p><strong>Status:</strong> {formatStatus(selectedLeave.status)}</p>
            <p><strong>Reason:</strong> {selectedLeave.reason || 'N/A'}</p>
            <p><strong>Manager:</strong> {selectedLeave.manager_name || 'N/A'}</p>

            {(selectedLeave.status !== "Cancelled" && selectedLeave.status !== "Rejected" &&
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

export default LeaveHistory;