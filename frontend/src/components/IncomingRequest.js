import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import api from '../utils/api';
import { Toast } from './Toast';
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

function IncomingRequests() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [comments, setComments] = useState({});
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncomingRequests();
  }, [user]);

  const fetchIncomingRequests = async () => {
    if (!user || user.role.name === "employee") return;
    try {
      const res = await api.get(`/leave/requests/${user.id}`);
      setIncomingRequests(res.data.incomingRequests);
    } catch {
      Toast.error('Error fetching incoming requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (approvalId, action) => {
    const comment = comments[approvalId] || "";
    try {
      await api.put(`/leave/${action}/${approvalId}`, {
        approverId: user.id,
        comments: comment
      });
      Toast.success(`Request ${action}ed successfully`);

      setIncomingRequests(prev =>
        prev.filter(req => req.approval_id !== approvalId)
      );

      setComments(prev => {
        const updated = { ...prev };
        delete updated[approvalId];
        return updated;
      });

    } catch {
      Toast.error(`Failed to ${action} request`);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const handleCommentChange = (id, value) => {
    setComments(prev => ({
      ...prev,
      [id]: value
    }));
  };

  if (loading) return (<div className="spinner-container">
    <div className="dot-spinner">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </div>)

  if (!incomingRequests.length) {
    return (
      <div className="no-requests">
        <h3>No Leave Requests</h3>
        <p>There are no leave requests requiring your approval at the moment.</p>
      </div>
    );
  }

  return (
    <div className="incoming-requests leave-history-container">
      <h3>Leave Requests for Approval</h3>
      <div className="scrollable-table">
        <table className="leave-history-table">
          <thead>
            <tr>
              <th>Requested By</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {incomingRequests.map(req => {
              const isPending = [1, 2, 3, 4].includes(req.status);
              return (
                <tr key={req.approval_id}>
                  <td>{req.employee_name}</td>
                  <td>{req.leave_type}</td>
                  <td>{formatDate(req.start_date)}</td>
                  <td>{formatDate(req.end_date)}</td>
                  <td>{statusMap[req.status] || "Unknown"}</td>
                  <td>
                    {isPending ? (
                      <>
                        <button
                          className='approve-btn'
                          onClick={() => handleApproveReject(req.approval_id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className='approve-btn reject-btn'
                          onClick={() => handleApproveReject(req.approval_id, 'reject')}
                        >
                          Reject
                        </button>
                      </>
                    ) : 'No actions'}
                  </td>
                  <td>
                    {isPending ? (
                      <textarea
                        placeholder="Any Comments..."
                        value={comments[req.approval_id] || ''}
                        onChange={(e) => handleCommentChange(req.approval_id, e.target.value)}
                        rows={3}
                        style={{ width: '150px' }}
                      />
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap', maxWidth: '150px' }}>
                        {comments[req.approval_id] || req.comments || 'No comments'}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomingRequests;