import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import api from '../utils/api';
import '../styles/history.css';
import { Toast } from './Toast';

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
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionComment, setActionComment] = useState('');

  useEffect(() => {
    if (user?.id) fetchLeaveHistory();
  }, [user]);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/leave/history/${user.id}`);
      setLeaveHistory(res.data.leaveHistory);
    } catch {
      setError('Error fetching leave history');
      Toast.error('Error fetching leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (leaveId) => {
    try {
      await api.put(`/leave/cancel/${leaveId}`, {
        comments: actionComment.trim(),
      });
      Toast.success('Leave cancelled');
      closeModal();
      fetchLeaveHistory();
    } catch (err) {
      console.error('Cancel failed:', err);
      Toast.error('Failed to cancel leave');
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB');
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const openModal = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
    setActionComment('');
  };

  const closeModal = () => {
    setSelectedLeave(null);
    setShowModal(false);
    setActionComment('');
  };

  const sortedHistory = [...leaveHistory].sort((a, b) =>
    a.status - b.status || new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="leave-history-container">
      {loading ? (
        <div className="spinner-container">
          <div className="dot-spinner">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : leaveHistory.length === 0 ? (
        <div className="no-requests">
          <h3>No Leave History</h3>
          <p>You haven't made any leave requests yet.</p>
        </div>
      ) : (
        <div className='scrollable-table'>
          <table className="leave-history-table">
            <thead>
              <tr>
                <th>Requested At</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Action Taken On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((leave) => (
                <tr key={leave.id}>
                  <td>{formatDateTime(leave.created_at)}</td>
                  <td>{leave.leave_type}</td>
                  <td>{formatDate(leave.start_date)}</td>
                  <td>{formatDate(leave.end_date)}</td>
                  <td>{statusMap[leave.status] || "Unknown"}</td>
                  <td>{formatDateTime(leave.updated_at)}</td>
                  <td>
                    <button onClick={() => openModal(leave)} className="view-button">
                      View Request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

            {(selectedLeave.status !== 6 &&
              selectedLeave.status !== 7 &&
              new Date(selectedLeave.start_date) > new Date()) && (
                <>
                  <label htmlFor="cancelComment"><strong>Add Comment:</strong></label>
                  <textarea
                    id="cancelComment"
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder="Enter reason for cancelling leave..."
                    rows={3}
                    style={{ width: '100%', marginBottom: '1rem' }}
                  />
                  <button
                    onClick={() => handleCancel(selectedLeave.id)}
                    className="cancel-button"
                  >
                    Cancel Leave
                  </button>
                </>
              )}

            <button onClick={closeModal} className="close-button" style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
