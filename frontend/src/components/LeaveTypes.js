import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Toast } from './Toast';
import '../styles/policy.css';

function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [draftLeaves, setDraftLeaves] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLeave, setNewLeave] = useState({
    leaveName: '',
    maxPerYear: 0,
    multiApprover: 1,
    accrualPerYear: 0,
    applicableFromRoleId: 4
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave/types');

      const drafts = {};
      res.data.leaveTypes.forEach((lt) => {
        drafts[lt.leaveName] = {
          leaveTypeId: lt.leaveTypeId,
          leaveName: lt.leaveName,
          maxPerYear: lt.maxPerYear || 0,
          multiApprover: lt.multiApprover,
          accrualPerYear: lt.accrualPerYear,
          applicableFromRoleId: lt.maxRoleId
        };
      });

      setLeaveTypes(res.data.leaveTypes);
      setDraftLeaves(drafts);
    } catch (err) {
      console.error('Error fetching leave types:', err);
      Toast.error('Failed to fetch leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (leaveName, field, value) => {
    setDraftLeaves(prev => ({
      ...prev,
      [leaveName]: {
        ...prev[leaveName],
        [field]: value
      }
    }));
  };

  const handleUpdate = async (leaveName) => {
    const updatedLeave = draftLeaves[leaveName];
    try {
      const payload = {
        name: updatedLeave.leaveName,
        maxPerYear: updatedLeave.maxPerYear,
        multiApprover: updatedLeave.multiApprover,
        accrual_per_year: updatedLeave.accrualPerYear,
        roleId: updatedLeave.applicableFromRoleId
      };
      await api.put(`/leave/types/${updatedLeave.leaveTypeId}`, payload);
      Toast.success('Leave policy updated');
      await fetchLeaveTypes();
    } catch (err) {
      console.error('Failed to update leave policy:', err);
      Toast.error('Failed to update leave policy');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/leave/types/${id}`);
      Toast.success('Leave type deleted');
      await fetchLeaveTypes();
    } catch (err) {
      console.error('Failed to delete leave type:', err);
      Toast.error('Failed to delete leave type');
    }
  };

  const handleAdd = async () => {
    try {
      const payload = {
        name: newLeave.leaveName,
        maxPerYear: newLeave.maxPerYear,
        multiApprover: newLeave.multiApprover,
        accrual_per_year: newLeave.accrualPerYear,
        roleId: newLeave.applicableFromRoleId
      };
      await api.post('/leave/types', payload);
      Toast.success('Leave type added successfully');
      setNewLeave({
        leaveName: '',
        maxPerYear: 0,
        multiApprover: 1,
        accrualPerYear: 0,
        applicableFromRoleId: 4
      });
      setShowAddForm(false);
      await fetchLeaveTypes();
    } catch (err) {
      console.error('Failed to add leave type:', err);
      Toast.error('Failed to add leave type');
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

  return (
    <div className="leave-policy-container">
      <div className="leave-types-grid leaves-section">
        {leaveTypes.map((lt, index) => {
          const draft = draftLeaves[lt.leaveName] || {};
          return (
            <div key={lt.leaveName + index} className="leave-card">
              <div className="leave-card-header">
                <input
                  className="leave-name-input"
                  value={draft.leaveName}
                  onChange={(e) => handleChange(lt.leaveName, 'leaveName', e.target.value)}
                  placeholder='Enter Leave Name'
                />
              </div>
              <div className="leave-card-body">
                <div className="leave-field-row">
                  <div className="leave-field-half">
                    <label className="leave-label">Max Days Per Year</label>
                    <input
                      type="number"
                      className="leave-input"
                      value={draft.maxPerYear}
                      onChange={(e) => handleChange(lt.leaveName, 'maxPerYear', Number(e.target.value))}
                    />
                  </div>
                  <div className="leave-field-half">
                    <label className="leave-label">Multi Approver</label>
                    <select
                      className="leave-select"
                      value={draft.multiApprover}
                      onChange={(e) => handleChange(lt.leaveName, 'multiApprover', Number(e.target.value))}
                    >
                      {[0, 1, 2, 3].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="leave-field-row">
                  <div className="leave-field-half">
                    <label className="leave-label">Accrual Per Year</label>
                    <input
                      type="number"
                      className="leave-input"
                      value={draft.accrualPerYear}
                      onChange={(e) => handleChange(lt.leaveName, 'accrualPerYear', Number(e.target.value))}
                    />
                  </div>
                  <div className="leave-field-half">
                    <label className="leave-label">Applicable From Role</label>
                    <select
                      className="leave-select"
                      value={draft.applicableFromRoleId}
                      onChange={(e) => handleChange(lt.leaveName, 'applicableFromRoleId', Number(e.target.value))}
                    >
                      <option value={1}>Admin</option>
                      <option value={2}>HR</option>
                      <option value={3}>Manager</option>
                      <option value={4}>Employee</option>
                    </select>
                  </div>
                </div>

                <div className="leave-actions">
                  <button className="save-btn" onClick={() => handleUpdate(lt.leaveName)}>Save</button>
                  <button className="delete-btn" onClick={() => handleDelete(lt.leaveTypeId)}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}

        {showAddForm ? (
          <div className="leave-card add-leave-card">
            <div className="leave-card-header">
              <input
                className="leave-name-input"
                value={newLeave.leaveName}
                onChange={(e) => setNewLeave({ ...newLeave, leaveName: e.target.value })}
                placeholder="Enter Leave Name"
              />
            </div>
            <div className="leave-card-body">
              <div className="leave-field-row">
                <div className="leave-field-half">
                  <label className="leave-label">Max Days Per Year</label>
                  <input
                    type="number"
                    className="leave-input"
                    value={newLeave.maxPerYear}
                    onChange={(e) => setNewLeave({ ...newLeave, maxPerYear: Number(e.target.value) })}
                  />
                </div>
                <div className="leave-field-half">
                  <label className="leave-label">Multi Approver</label>
                  <select
                    className="leave-select"
                    value={newLeave.multiApprover}
                    onChange={(e) => setNewLeave({ ...newLeave, multiApprover: Number(e.target.value) })}
                  >
                    {[0, 1, 2, 3].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="leave-field-row">
                <div className="leave-field-half">
                  <label className="leave-label">Accrual Per Year</label>
                  <input
                    type="number"
                    className="leave-input"
                    value={newLeave.accrualPerYear}
                    onChange={(e) => setNewLeave({ ...newLeave, accrualPerYear: Number(e.target.value) })}
                  />
                </div>
                <div className="leave-field-half">
                  <label className="leave-label">Applicable From Role</label>
                  <select
                    className="leave-select"
                    value={newLeave.applicableFromRoleId}
                    onChange={(e) => setNewLeave({ ...newLeave, applicableFromRoleId: Number(e.target.value) })}
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>HR</option>
                    <option value={3}>Manager</option>
                    <option value={4}>Employee</option>
                  </select>
                </div>
              </div>

              <div className="leave-actions">
                <button className="save-btn" onClick={handleAdd}>Add</button>
                <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <button className="add-leave-btn" onClick={() => setShowAddForm(true)}>+ Add Leave Type</button>
        )}
      </div>
    </div>
  );
}

export default LeaveTypes;