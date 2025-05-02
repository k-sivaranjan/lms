const { EntitySchema } = require("typeorm");

const LeaveType = new EntitySchema({
  name: "LeaveType", // Entity name
  tableName: "leave_types", // MySQL table name
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true, // Auto increment in MySQL
    },
    name: {
      type: String,
    },
    maxPerYear: {
      name: "max_per_year", // Maps to `max_per_year` column in MySQL
      type: Number,
    },
    multiApprover: {
      name: "multi_approver", // Maps to `multi_approver` column in MySQL
      type: Number, // Using Boolean to represent tinyint(1) values (0 or 1)
      default: 1, // Default value is `true`, meaning multi-approver is enabled
    },
  },
  relations: {
    leaveRequests: {
      type: "one-to-many", // One leave type can have many leave requests
      target: "LeaveRequest", // Target entity
      inverseSide: "leaveType", // Field on LeaveRequest entity that references LeaveType
    },
    leaveBalances: {
      type: "one-to-many", // One leave type can have many leave balances
      target: "LeaveBalance", // Target entity
      inverseSide: "leaveType", // Field on LeaveBalance entity that references LeaveType
    },
  },
});

module.exports = { LeaveType };