import React, { useState, useEffect } from 'react';
import { useUser } from '../userContext';
import api from "../api";

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
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIncomingRequests();
  }, [user]);

  const fetchIncomingRequests = async () => {
    if (!user || user.role.name === "employee") return;
    try {
      const res = await api.get(`/leave/requests/${user.id}`);
      setIncomingRequests(res.data.incomingRequests);
    } catch {
      setError('Error fetching incoming requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (requestId, action) => {
    try {
      await api.put(`/leave/${action}/${requestId}`);
      alert(`Request ${action}ed successfully`);
      setIncomingRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: action === 'approve' ? 5 : 6 } : req
        )
      );
    } catch {
      alert(`Failed to ${action} request`);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  if (!incomingRequests.length) {
    return (
      <div className="no-requests">
        <h3>No Leave Requests</h3>
        <p>There are no leave requests requiring your approval at the moment.</p>
      </div>
    );
  }

  return (
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
                <td>{statusMap[req.status] || "Unknown"}</td>
                <td>
                  {[1, 2, 3, 4].includes(req.status) ? (
                    <>
                      <button className='approve-btn' onClick={() => handleApproveReject(req.id, 'approve')}>
                        Approve
                      </button>
                      <button className='approve-btn reject-btn' onClick={() => handleApproveReject(req.id, 'reject')}>
                        Reject
                      </button>
                    </>
                  ) : 'No actions'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomingRequests;