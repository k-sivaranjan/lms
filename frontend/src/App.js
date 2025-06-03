import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './userContext';
import axios from 'axios';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './components/Profile';
import RequestLeave from './components/RequestLeave';
import AddUser from './components/AddUser';
import AddManyUser from './components/AddManyUser';
import Calendar from './components/Calendar';
import History from './components/History';
import RequestsHistory from './components/RequestsHistory';
import IncomingRequests from './components/IncomingRequest';
import Navbar from './components/Navbar';
import LeaveTypes from './components/LeaveTypes';
import AllUsers from './components/AllUsers';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/request-leave" element={<ProtectedRoute><RequestLeave /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/team-history" element={<ProtectedRoute><RequestsHistory /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><IncomingRequests /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><AllUsers /></ProtectedRoute>} />
          <Route path="/leave-types" element={<ProtectedRoute><LeaveTypes /></ProtectedRoute>} />
          <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
          <Route path="/add-many-users" element={<ProtectedRoute><AddManyUser /></ProtectedRoute>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;