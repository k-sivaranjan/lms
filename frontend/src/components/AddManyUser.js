import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Toast } from './Toast';
import '../styles/addUser.css';

function AddManyUser() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      Toast.error('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/auth/upload-users', formData);

      if (res.status >= 200 && res.status < 300) {
        Toast.success(res.data.message || 'Users uploaded successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        Toast.error(res.data.message || 'Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err.response || err.message);
      Toast.error(err.response?.data?.message || 'Failed to upload file.');
    }
  };

  return (
    <div className="add-user-form">
      <h3>Add Multiple Users</h3>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default AddManyUser;
