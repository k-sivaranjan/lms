const { EntitySchema } = require("typeorm");

// Schema for the LeaveBalance entity
const LeaveBalance = new EntitySchema({
  name: "LeaveBalance",
  tableName: "leave_balances",
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    userId: {
      name: "user_id",
      type: Number,
    },
    leaveTypeId: {
      name: "leave_type_id",
      type: Number,
    },
    year: {
      type: Number,
    },
    balance: {
      type: "float", 
    },
    used: {
      type: "float",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      inverseSide: "leaveBalances",
    },
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: { name: "leave_type_id" },
      inverseSide: "leaveBalances",
    },
  },
});

module.exports = { LeaveBalance };