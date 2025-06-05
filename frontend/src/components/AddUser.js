import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/addUser.css';
import { Toast } from './Toast';

function AddUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    reportingManagerId: ''
  });

  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role, reportingManagerId } = formData;

    if (!name || !email || !password || !role || !reportingManagerId) {
      Toast.error('Please fill in all fields.');
      return;
    }

    try {
      const { status } = await api.post('/auth/register', formData);

      if (status === 201) {
        Toast.success('User created successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        Toast.error('User with this email already exists.');
      } else {
        Toast.error('Failed to create user.');
      }
    }
  };

  return (
    <div className="add-user-form">
      <h3>Add New User</h3>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="off"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="off"
        />
        <input
          type="number"
          name="reportingManagerId"
          placeholder="Reporting Manager ID"
          value={formData.reportingManagerId}
          onChange={handleChange}
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="hr">HR</option>
        </select>
        <button type="submit">Create User</button>
        <button type="button" onClick={() => navigate("/add-many-users")}>Add Multiple Users</button>
      </form>
    </div>
  );
}

export default AddUser;