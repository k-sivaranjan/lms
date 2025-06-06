import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import api from "../utils/api";
import '../styles/loader.css';

function AllUsers() {
    const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resUsers, resLeave] = await Promise.all([
                api.get('/auth/users'),
                api.get('/leave/on-leave-today')
            ]);

            setAllUsers(resUsers.data.data.users);
            setUsersOnLeaveToday(resLeave.data?.users || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
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
        <section className="section-container">
            <h3>All Users</h3>
            <div className="section table-scroll">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>ID</th>
                            <th style={{ width: '60%' }}>Name & Status</th>
                            <th style={{ width: '30%' }}>Role</th>
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