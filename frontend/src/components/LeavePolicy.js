import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/policy.css';

function LeavePolicy() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeave, setNewLeave] = useState({ name: '', max_days: 0, multi_approver: 1 });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leave/types');
      setLeaveTypes(res.data);
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...leaveTypes];
    updated[index][field] = value;
    setLeaveTypes(updated);
  };

  const handleUpdate = async (id, updatedLeave) => {
    try {
      await axios.put(`http://localhost:5000/api/leave/types/${id}`, updatedLeave);
      alert('Leave policy updated');
      fetchLeaveTypes();
    } catch (err) {
      alert('Failed to update leave policy');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/leave/types/${id}`);
      fetchLeaveTypes();
    } catch (err) {
      alert('Failed to delete leave type');
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:5000/api/leave/types', newLeave);
      setNewLeave({ name: '', max_days: 0, multi_approver: 1 });
      fetchLeaveTypes();
    } catch (err) {
      alert('Failed to add leave type');
    }
  };

  return (
    <div className="leave-policy-container">
      <h3>Leave Policy</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Max Days</th>
            <th>Multi Approver</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveTypes.map((lt, index) => (
            <tr key={lt.id}>
              <td>
                <input
                  value={lt.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={lt.max_days}
                  onChange={(e) => handleChange(index, 'max_days', Number(e.target.value))}
                />
              </td>
              <td>
                <select
                  value={lt.multi_approver}
                  onChange={(e) => handleChange(index, 'multi_approver', Number(e.target.value))}
                >
                  {[0, 1, 2, 3].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handleUpdate(lt.id, lt)}>Save</button>
                <button onClick={() => handleDelete(lt.id)}>Delete</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input
                value={newLeave.name}
                onChange={(e) => setNewLeave({ ...newLeave, name: e.target.value })}
                placeholder="Leave Name"
              />
            </td>
            <td>
              <input
                type="number"
                value={newLeave.max_days}
                onChange={(e) => setNewLeave({ ...newLeave, max_days: Number(e.target.value) })}
              />
            </td>
            <td>
              <select
                value={newLeave.multi_approver}
                onChange={(e) => setNewLeave({ ...newLeave, multi_approver: Number(e.target.value) })}
              >
                {[0, 1, 2, 3].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <button onClick={handleAdd}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default LeavePolicy;