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
- `POST /add-user` - Add a new user

### 📅 Leave Requests
- `POST /request` - Submit a leave request
- `PUT /cancel/:leaveRequestId` - Cancel a leave request
- `GET /history/:userId` - Get leave history of a user

### 📊 Leave Balance
- `GET /balance/:userId` - Get current leave balance for a user

### ✅ Leave Approvals
- `GET /requests/:userId` - Get incoming leave requests (for manager/HR/Admin)
- `PUT /approve/:approveId` - Approve a leave request
- `PUT /reject/:rejectId` - Reject a leave request

### 📌 Leave Types & Policy Management (Admin)
- `GET /types` - Fetch all leave types
- `POST /types` - Create a new leave type
- `PUT /types/:id` - Update an existing leave type
- `DELETE /types/:id` - Delete a leave type

### 📍 Attendance Tracking
- `GET /on-leave-today` - Fetch users who are on leave today

---

## 🛠️ Tech Stack

- **Frontend**: React JS
- **Backend**: Node.js + Express.js
- **Database**: MySQL

---
