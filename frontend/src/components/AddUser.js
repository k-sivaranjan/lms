import React, { useState } from 'react';
import axios from 'axios';
import '../styles/addUser.css';

function AddUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    reportingManagerId: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role, reportingManagerId } = formData;

    if (!name || !email || !password || !role || !reportingManagerId) {
      setMessage('');
      setError('Please fill in all fields.');
      return;
    }

    try {
      const { status } = await axios.post('http://localhost:5000/api/auth/register', formData);

      if (status === 201) {
        setMessage('User created successfully!');
        setError('');
      }
    } catch (err) {
      setMessage('');
      setError(err.response?.status === 400 ? 'User with this email already exists.' : 'Failed to create user due to server error.');
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
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
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
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AddUser;