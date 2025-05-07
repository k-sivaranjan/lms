# Leave Management System

A Leave Management System built with **React**, **Node.js**, **Express**, and **MySQL**. It supports multiple user roles: **Employee**, **Manager**, **HR**, and **Admin**, and includes leave request,multi level approval,leave balance, and management functionalities.

## 🚀 Features

### 👥 User Roles
- **Employee , Manager , HR**: Request leave, view leave balance and history, cancel leave.
- **Manager , HR**: Approve or reject leave requests from team members.
- **Admin**: Monitor and manage overall leave requests. Add users, manage leave types and policies, track current absentees.Approve/Reject leaves for certain criterias.

---

## 📦 API Routes

### 👤 User Management
- `GET /users` - Fetch all users
- `POST /register` - Add a new user
- `POST /login` - Login as a user

### 📅 Leave Requests
- `POST /api/leave/request` - Submit a leave request
- `PUT /api/leave/cancel/:leaveRequestId` - Cancel a leave request
- `GET /api/leave/history/:userId` - Get leave history of a user

### 📊 Leave Balance
- `GET /api/leave/balance/:userId` - Get current leave balance for a user

### ✅ Leave Approvals
- `GET /api/leave/requests/:userId` - Get incoming leave requests (for manager/HR/Admin)
- `PUT /api/leave/approve/:approveId` - Approve a leave request
- `PUT /api/leave/reject/:rejectId` - Reject a leave request

### 📌 Leave Types & Policy Management (Admin)
- `GET /api/leave/types` - Fetch all leave types
- `POST /api/leave/types` - Create a new leave type
- `PUT /api/leave/types/:id` - Update an existing leave type
- `DELETE /api/leave/types/:id` - Delete a leave type

### 📍 Attendance Tracking
- `GET /api/leave/on-leave-today` - Fetch users who are on leave today

### 👥 Team View
- `GET /api/leave/team-leaves` - Fetch leave status of your team

## 🛠️ Tech Stack

- **Frontend**: React JS
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **ORM**: TypeORM

---
