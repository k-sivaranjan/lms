import React, { useState, useEffect } from 'react';
import api from "../api"
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
  const [totalDays,setTotalDays] = useState('')

  // Fetch leave types when the component mounts
  useEffect(() => {
    api.get('/api/leave/types')
      .then((res) => setLeaveTypes(res.data))
      .catch((err) => console.error('Error fetching leave types:', err));
  }, []);

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
        const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          dayCount++;
        }
        current.setDate(current.getDate() + 1);
      }
  
      setTotalDays(isHalfDay ? 0.5 : dayCount);
    };
  
    calculateLeaveDays();
  }, [startDate, endDate, isHalfDay]);
  

  // Handle form submission
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
      const res = await api.post('/api/leave/request', {
        userId: user.id,
        managerId:user.managerId,
        leaveTypeId,
        startDate,
        endDate,
        isHalfDay,
        halfDayType: isHalfDay ? halfDayType : null,
        reason,
        totalDays
      });

      const requestId = res.data.result?.insertId;

      if (parseInt(leaveTypeId) === 9 && requestId) {
        await api.put(`leave/approve/${requestId}`);
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

      if (err.response && err.response.data && err.response.data.error) {
        console.log(err.response.data.error);
      } else {
        alert('Error submitting leave request');
      }
    }
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
        Total Leave Days: {totalDays}
      </p>


      <div className="leave-request-button-container">
        <button className="leave-request-submit-btn" type="submit">Submit Request</button>
      </div>
    </form>
  );
}

export default LeaveRequest;
