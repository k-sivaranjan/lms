const { EntitySchema } = require("typeorm");

const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

//Schema for User entity
const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true, 
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: "enum",
      enum: UserRole, 
      default: UserRole.EMPLOYEE,
    },
    managerId: {
      name: "manager_id",
      type: Number,
      nullable: true, 
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP", 
    },
  },
  relations: {
    manager: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "manager_id",
      },
      inverseSide: "directReports",
    },
    directReports: {
      type: "one-to-many",
      target: "User",
      inverseSide: "manager",
    },
    leaveRequests: {
      type: "one-to-many",
      target: "LeaveRequest",
      inverseSide: "user",
    },
    leaveBalances: {
      type: "one-to-many",
      target: "LeaveBalance",
      inverseSide: "user",
    },
  },
});

module.exports = { User, UserRole };