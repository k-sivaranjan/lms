import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import api from "../utils/api";

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
        if (!res.data) {
            setUsersOnLeaveToday([]);
        } else {
            setUsersOnLeaveToday(res.data.users);
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

export default AllUsers