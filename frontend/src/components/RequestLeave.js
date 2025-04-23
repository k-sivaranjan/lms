import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../userContext';
import { useNavigate } from 'react-router-dom';
import '../styles/request.css'; 

function LeaveRequest({ onRequestSuccess }) {
  const { user } = useUser();
  const navigate = useNavigate();

  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Fetch leave types from the API
    axios.get('http://localhost:5000/api/leave/types')
      .then((res) => setLeaveTypes(res.data))
      .catch((err) => console.error('Error fetching leave types:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveTypeId || !startDate || !endDate || !reason || (isHalfDay && !halfDayType)) {
      alert('Please fill all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/leave/request', {
        userId: user.id,
        leaveTypeId,
        startDate,
        endDate,
        isHalfDay,
        halfDayType: isHalfDay ? halfDayType : null,
        reason
      });

      const requestId = res.data.result?.insertId;

      if (parseInt(leaveTypeId) === 9 && requestId) {
        await axios.put(`http://localhost:5000/api/leave/approve/${requestId}`);
      }

      alert('Leave requested successfully');
      onRequestSuccess?.();

      setLeaveTypeId('');
      setStartDate('');
      setEndDate('');
      setIsHalfDay(false);
      setHalfDayType('');
      setReason('');

      navigate('/');
    } catch (err) {
      console.error('Error submitting leave request:', err);
      alert('Error submitting leave request');
    }
  };

  const getLeaveDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

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

      <label className="leave-request-label">Start Date:</label>
      <input
        className="leave-request-input"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />

      <label className="leave-request-label">End Date:</label>
      <input
        className="leave-request-input"
        type="date"
        value={endDate}
        min={startDate}
        onChange={(e) => setEndDate(e.target.value)}
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

      <label className="leave-request-label">Reason:</label>
      <textarea
        className="leave-request-textarea"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />

      <p className="leave-request-days">
        Total Leave Days: {isHalfDay ? "0.5 (Half Day)" : getLeaveDays()}
      </p>

      <div className="leave-request-button-container">
        <button className="leave-request-submit-btn" type="submit">Submit Request</button>
      </div>
    </form>
  );
}

export default LeaveRequest;
