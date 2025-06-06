import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../utils/userContext';
import api from "../utils/api";
import { Toast } from './Toast';
import '../styles/request.css';
import '../styles/loader.css';

function LeaveRequest() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [leaveDetails, setLeaveDetails] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('');
  const [reason, setReason] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalance();
    fetchLeaveTypes();
    fetchLeaveHistory()
  }, [user]);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get(`/leave/types/${user.id}`);
      setLeaveTypes(res.data.leaveTypes);
    } catch (err) {
      setError("Error fetching leave types.");
    }
  };

  const fetchBalance = async () => {
    if (!user || user.role.name === "admin") {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/leave/balance/${user.id}`);
      setLeaveDetails(res.data.leaveDetails);
    } catch {
      setError('Error fetching leave balance');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const calculateLeaveDays = () => {
      if (!startDate || !endDate) {
        setTotalDays(0);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setTotalDays(0);
        return;
      }

      let dayCount = 0;
      let current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          dayCount++;
        }
        current.setDate(current.getDate() + 1);
      }

      setTotalDays(isHalfDay ? 0.5 : dayCount);
    };

    calculateLeaveDays();
  }, [startDate, endDate, isHalfDay]);

  const selectedBalance = leaveDetails.find(b => b.leave_id === parseInt(leaveTypeId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveTypeId || !startDate || !endDate || !reason || (isHalfDay && !halfDayType)) {
      Toast.error('Please fill all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      Toast.error('End date cannot be before start date.');
      return;
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const hasOverlap = leaveHistory.some((leave) => {
      if (leave.status === 7) return false;

      const existingStart = new Date(leave.start_date);
      const existingEnd = new Date(leave.end_date);

      return !(newEnd < existingStart || newStart > existingEnd);
    });

    if (hasOverlap) {
      Toast.error("You already have a leave applied for these dates.");
      return;
    }

    try {
      const res = await api.post('/leave/request', {
        userId: user.id,
        managerId: user.managerId,
        leaveTypeId,
        startDate,
        endDate,
        isHalfDay,
        halfDayType: isHalfDay ? halfDayType : null,
        reason,
        totalDays
      });

      Toast.success('Leave requested successfully');

      setLeaveTypeId('');
      setStartDate('');
      setEndDate('');
      setIsHalfDay(false);
      setHalfDayType('');
      setReason('');

      navigate("/");
    } catch (err) {
      Toast.error(err.response?.data?.error || "Error submitting leave request.");
    }
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

  if (error) {
    return (
      <div className="error-message">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="leave-request-form">
      <h3 className="leave-request-title">Request Leave</h3>

      <label className="leave-request-label">Leave Type:</label>
      <select
        className="leave-request-input"
        value={leaveTypeId}
        onChange={(e) => setLeaveTypeId(e.target.value)}
        required
      >
        <option value="">Select</option>
        {leaveTypes.map((type) => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>

      {leaveTypeId && selectedBalance && (
        <p className="leave-request-balance">
          You have <span className='leave'>{selectedBalance.balance} days</span> balance for {selectedBalance.leave_type}
        </p>
      )}

      <label className="leave-request-label">Start Date:</label>
      <input
        className="leave-request-input"
        type="date"
        value={startDate}
        onChange={(e) => {
          const selected = e.target.value;
          setStartDate(selected);
          if (!endDate || new Date(endDate) < new Date(selected)) {
            setEndDate(selected);
          }
        }}
        required
      />

      <label className="leave-request-label">End Date:</label>
      <input
        className="leave-request-input"
        type="date"
        value={endDate}
        min={startDate}
        onChange={(e) => setEndDate(e.target.value)}
        disabled={!startDate}
        required
      />

      <label className="leave-request-checkbox-label">
        <input
          className="leave-request-checkbox"
          type="checkbox"
          checked={isHalfDay}
          onChange={(e) => setIsHalfDay(e.target.checked)}
        />
        Half Day
      </label>

      {isHalfDay && (
        <>
          <label className="leave-request-label">Half Day Type:</label>
          <select
            className="leave-request-input"
            value={halfDayType}
            onChange={(e) => setHalfDayType(e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </>
      )}

      <label className="leave-request-label">Add Comments:</label>
      <textarea
        className="leave-request-textarea"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />

      <p className="leave-request-days">
        Total Leave Days: {totalDays}
      </p>

      <div className="leave-request-button-container">
        <button className="leave-request-submit-btn" type="submit">Submit Request</button>
      </div>
    </form>
  );
}

export default LeaveRequest;