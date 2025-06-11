const { EntitySchema } = require("typeorm");

const LeaveType = new EntitySchema({
  name: "LeaveType",
  tableName: "leave_types",
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    name: {
      type: String,
    },
    maxPerYear: {
      name: "max_per_year",
      type: Number,
      nullable: true
    },
    multiApprover: {
      name: "multi_approver",
      type: Number,
      default: 1,
    },
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true, 
    }
  },
  relations: {
    leaveRequests: {
      type: "one-to-many",
      target: "LeaveRequest",
      inverseSide: "leaveType",
    },
    leaveBalances: {
      type: "one-to-many",
      target: "LeaveBalance",
      inverseSide: "leaveType",
      onDelete: "CASCADE",
    },
    leavePolicies: {
      type: "one-to-many",
      target: "LeavePolicy",
      inverseSide: "leaveType",
      onDelete: "CASCADE",
    }
  },
});

module.exports = { LeaveType };