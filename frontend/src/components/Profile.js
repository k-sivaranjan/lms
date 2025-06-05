import { useState } from 'react';
import { useUser } from '../utils/userContext';
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Toast } from './Toast';
import '../styles/profile.css';

function Profile() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordUpdate = async () => {
        if (!password || password.length < 6) {
            Toast.error('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Toast.error('Passwords do not match.');
            return;
        }

        try {
            const res = await api.put(`/auth/password/${user.id}`, { password });
            Toast.success(res.data.message || 'Password updated successfully');
            setPassword('');
            setConfirmPassword('');
            navigate("/");
        } catch (err) {
            Toast.error('Failed to update password');
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
                <input type="text" value={user.role.name} readOnly />
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
        </div>
    );
}

export default Profile;