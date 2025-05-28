import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/addUser.css';

function AddManyUser() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/auth/upload-users', formData);

      if (res.status >= 200 && res.status < 300) {
        setMessage(res.data.message);
        setError('');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(res.data.message);
        setMessage('');
      }
    } catch (err) {
      console.error('Upload error:', err.response || err.message);
      setError(err.response?.data?.message || 'Failed to upload file.');
      setMessage('');
    }
  };

  return (
    <div className="add-user-form">
      <h3>Add Multiple Users</h3>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".xlsx, .xls , .csv" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AddManyUser;