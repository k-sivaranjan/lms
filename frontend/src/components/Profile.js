import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../userContext';
import axios from 'axios';
import '../styles/profile.css';

function Profile() {
    const navigate = useNavigate()
    const { user } = useUser();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordUpdate = async () => {
        if (!password || password.length < 6) {
            return setMessage('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
            return setMessage('Passwords do not match.');
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/auth/password/${user.id}`, { password });
            setMessage(res.data.message || 'Password updated successfully');
            setPassword('');
            setConfirmPassword('');
            navigate("/")
        } catch (err) {
            setMessage('Failed to update password');
        }
    };

    return (
        <div className="profile-container">
            <h2>User Profile</h2>
            <div className="profile-field">
                <label>Name:</label>
                <input type="text" value={user.name} readOnly />
            </div>
            <div className="profile-field">
                <label>Email:</label>
                <input type="email" value={user.email} readOnly />
            </div>
            <div className="profile-field">
                <label>Role:</label>
                <input type="text" value={user.role} readOnly />
            </div>
            <div className="profile-field">
                <label>New Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="profile-field">
                <label>Confirm Password:</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button className='update-btn' onClick={handlePasswordUpdate}>Update Password</button>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default Profile;
