import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/policy.css';

function LeavePolicy() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeave, setNewLeave] = useState({ name: '', maxPerYear: 0, multiApprover: 1 });

  // Fetch leave types when the component mounts
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Function to fetch leave types from backend
  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leave/types');
      setLeaveTypes(res.data);
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  };

  // Handle changes in input fields
  const handleChange = (index, field, value) => {
    const updated = [...leaveTypes];
    updated[index][field] = value;
    setLeaveTypes(updated);
  };

  // Handle updates of leave type
  const handleUpdate = async (id, updatedLeave) => {
    try {
      await axios.put(`http://localhost:5000/api/leave/types/${id}`, updatedLeave);
      alert('Leave policy updated');
      fetchLeaveTypes();
    } catch {
      alert('Failed to update leave policy');
    }
  };
// Handle deletion of a leave type
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/leave/types/${id}`);
      fetchLeaveTypes();
    } catch {
      alert('Failed to delete leave type');
    }
  };

  // Handle addition of a new leave type
  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:5000/api/leave/types', newLeave);
      setNewLeave({ name: '', maxPerYear: 0, multiApprover: 1 });
      fetchLeaveTypes();
    } catch {
      alert('Failed to add leave type');
    }
  };

  return (
    <div className="leave-policy-container">
      <h3 className="leave-policy-title">Leave Policy</h3>
      <div className="leave-types-grid">
        {leaveTypes.map((lt, index) => (
          <div key={lt.id} className="leave-card">
            <div className="leave-card-header">
              <input
                className="leave-name-input"
                value={lt.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
            </div>
            <div className="leave-card-body">
              <div className="leave-field">
                <label className="leave-label">Max Days Per Year</label>
                <input
                  type="number"
                  className="leave-input"
                  value={lt.maxPerYear}
                  onChange={(e) => handleChange(index, 'maxPerYear', Number(e.target.value))}
                />
              </div>
              <div className="leave-field">
                <label className="leave-label">Multi Approver</label>
                <select
                  className="leave-select"
                  value={lt.multiApprover}
                  onChange={(e) => handleChange(index, 'multiApprover', Number(e.target.value))}
                >
                  {[0, 1, 2, 3].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="leave-actions">
                <button className="save-btn" onClick={() => handleUpdate(lt.id, lt)}>
                  Save
                </button>
                <button className="delete-btn" onClick={() => handleDelete(lt.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="leave-card add-leave-card">
          <div className="leave-card-header add-card-header">
            <input
              className="leave-name-input"
              value={newLeave.name}
              onChange={(e) => setNewLeave({ ...newLeave, name: e.target.value })}
              placeholder="Leave Name"
            />
          </div>
          <div className="leave-card-body">
            <div className="leave-field">
              <label className="leave-label">Max Days Per Year</label>
              <input
                type="number"
                className="leave-input"
                value={newLeave.maxPerYear}
                onChange={(e) => setNewLeave({ ...newLeave, maxPerYear: Number(e.target.value) })}
              />
            </div>
            <div className="leave-field">
              <label className="leave-label">Multi Approver</label>
              <select
                className="leave-select"
                value={newLeave.multiApprover}
                onChange={(e) => setNewLeave({ ...newLeave, multiApprover: Number(e.target.value) })}
              >
                {[0, 1, 2, 3].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="leave-actions">
              <button className="add-btn" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeavePolicy;
