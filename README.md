# Leave Management System

A Leave Management System built with **React**, **Node.js**, **Express**, and **MySQL**. It supports **multi-role architecture**: **Employee**, **Manager**, **HR**, and **Admin**, with features like multi-level approvals, real-time calendar view of team leaves, Redis queueing for bulk operations, and detailed leave policies and balances.

---

## 🚀 Features

### 👥 User Roles

- **Employee, Manager, HR**:
  - Submit leave requests
  - View leave balance and history
  - Cancel leaves
  - Change their password
- **Manager, HR**:
  - View incoming leave requests from their team
  - Approve or reject leave requests
  - View team leave calendar
- **Admin**:
  - Full access to leave requests and approvals
  - Manage users and leave types/policies
  - View who's on leave today
  - Upload users in bulk using Redis and Bull
  - Approve/Reject as per special criteria

---

## 📅 Functional Modules

- ✅ Multi-level leave approval workflow
- 📊 Accurate leave balance tracking with used, remaining, and max limits
- ❌ Overlapping leave prevention
- 📦 Bulk user upload with Redis + Bull
- 📆 Calendar UI to visualize team leave status
- 🔐 Password update capability
- 🧭 Role-based access control with middleware
- 🔁 Reusable Express middleware for authentication and role checking

---

## 🧩 Database Schema Overview

- `users` – User details
- `roles` – Defines available roles
- `leave_requests` – Leave submissions
- `leave_approvals` – Tracks each level of approval
- `leave_types` – Types of leaves
- `leave_policies` – Policy metadata
- `leave_balances` – Tracks current leave balances and used leaves per user

---

## 📦 API Routes

### 🔐 Authentication & Users

- `POST /login` – Login as a user
- `POST /register` – [Admin only] Register a new user
- `GET /users` – [Admin only] Fetch all users
- `POST /upload-users` – [Admin only] Bulk upload users using Excel + Redis
- `PUT /password/:userId` – Update user password

---

### 📝 Leave Requests

- `POST /request` – Submit a leave request
- `PUT /cancel/:leaveRequestId` – Cancel a submitted leave
- `GET /history/:userId` – Get leave history for a user
- `GET /requests/history/:userId` – Get all requests submitted by the user

---

### 📊 Leave Balance

- `GET /balance/:userId` – Get leave balance for a specific user

---

### ✅ Leave Approvals

- `GET /requests/:userId` – View incoming leave requests (Manager, HR, Admin)
- `PUT /approve/:approveId` – Approve a pending leave
- `PUT /reject/:rejectId` – Reject a pending leave

---

### 🗂️ Leave Types & Policy Management

- `GET /types/:userId` – Fetch leave types applicable to the user’s role
- `GET /types` – Fetch all leave types
- `POST /types` – [Admin only] Create a new leave type
- `PUT /types/:id` – [Admin only] Update a leave type
- `DELETE /types/:id` – [Admin only] Delete a leave type

---

### 🗓️ Admin & Team

- `GET /on-leave-today` – [Admin only] List users on leave today
- `GET /team-leaves` – View team leave status in a calendar-style view

---

## 🧪 Tech Stack

### 💻 Frontend
- **React.js**
- React Router for navigation
- Recharts for charts
- Custom calendar and dashboard components

### 🖥️ Backend
- **Node.js** + **Express.js**
- MySQL + TypeORM (ORM)
- Redis + Bull for queueing (bulk uploads)
- Role-based access control
- Middleware-based authentication using JWT

### 🗃️ Database
- **MySQL**:
  - Normalized structure
  - Support for multi-approver workflows
  - Optimized indexes and relations

---

## ⚙️ Database Setup with Auto Seeder

This project includes **seeder scripts**, so when you run the backend with `synchronize: true` enabled in your TypeORM configuration:

- You just need to create a db and mention that in env
- All required tables will be created automatically
- Initial data like roles, leave types, and default admin user will be inserted automatically
