const { EntitySchema } = require("typeorm");

const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

const User = new EntitySchema({
  name: "User", // Name of the entity
  tableName: "users", // Name of the table in MySQL
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true, // Auto increment in MySQL
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true, // Ensures unique email field
    },
    password: {
      type: String,
    },
    role: {
      type: "enum",
      enum: UserRole, // Enum values for user roles
      default: UserRole.EMPLOYEE, // Default role is 'employee'
    },
    managerId: {
      name: "manager_id", // Column name in MySQL
      type: Number,
      nullable: true, // Can be null for employees without a manager
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP", // Default value is current timestamp
    },
  },
  relations: {
    manager: {
      type: "many-to-one", // A manager can have many employees
      target: "User", // Target is another User entity
      joinColumn: {
        name: "manager_id", // Join column in the User table
      },
      inverseSide: "directReports", // The inverse side of the relationship
    },
    directReports: {
      type: "one-to-many", // A user can have multiple direct reports
      target: "User", // Target is the same User entity
      inverseSide: "manager", // Inverse side is the 'manager' field in the User entity
    },
    leaveRequests: {
      type: "one-to-many", // A user can have many leave requests
      target: "LeaveRequest", // Target is LeaveRequest entity
      inverseSide: "user", // Inverse side of the relationship
    },
    leaveBalances: {
      type: "one-to-many", // A user can have multiple leave balances
      target: "LeaveBalance", // Target is LeaveBalance entity
      inverseSide: "user", // Inverse side of the relationship
    },
  },
});

module.exports = { User, UserRole };