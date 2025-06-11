import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import api from "../utils/api";
import {Toast} from "./Toast"

function AllUsers() {
    const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchUsersOnLeaveToday();
            fetchAllUsers();
        }
    }, [user]);

    const fetchAllUsers = async () => {
        const res = await api.get('/auth/users');
        setAllUsers(res.data.data.users);
    };

    const fetchUsersOnLeaveToday = async () => {
        const res = await api.get('/leave/on-leave-today');
        setUsersOnLeaveToday(res.data?.users || []);
    };

    const handleDeleteUser = async (userId) => {
        const confirm = window.confirm("Are you sure you want to delete this user?");
        if (!confirm) return;

        try {
            const res = await api.delete(`/auth/users/${userId}`);
            Toast.success(res.data.message)
            fetchAllUsers();
        } catch (error) {
            console.error("Delete failed:", error);
            Toast.error("Error deleting user.");
        }
    };

    return (
        <section className="section-container">
            <h3>All Users</h3>
            <div className="section table-scroll">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>ID</th>
                            <th style={{ width: '40%' }}>Name & Status</th>
                            <th style={{ width: '30%' }}>Role</th>
                            <th style={{ width: '20%' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map(user => {
                            const isOnLeave = usersOnLeaveToday.some(u => u.id === user.id);
                            return (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>
                                        <span>{user.name}</span>
                                        <button className={`status-btn ${isOnLeave ? 'out' : 'in'}`}>
                                            {isOnLeave ? 'Out' : 'In'}
                                        </button>
                                    </td>
                                    <td>{user.role.name}</td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default AllUsers;