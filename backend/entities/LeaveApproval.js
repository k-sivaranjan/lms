const { EntitySchema } = require("typeorm");
const { LeaveStatus } = require('../entities/LeaveRequest');

const LeaveApproval = new EntitySchema({
  name: "LeaveApproval",
  tableName: "leave_approvals",
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    leaveRequestId: {
      name: "leave_request_id",
      type: Number,
    },
    approverId: {
      name: "approver_id",
      type: Number,
    },
    approvalLevel: {
      name: "approval_level",
      type: Number,
    },
    status: {
      type: "int",
      default: LeaveStatus.PENDING,
    },
    comments: {
      type: String,
      nullable: true,
    },
    actedAt: {
      name: "acted_at",
      type: "timestamp",
      nullable: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true,
    }
  },
  relations: {
    leaveRequest: {
      type: "many-to-one",
      target: "LeaveRequest",
      joinColumn: { name: "leave_request_id" },
      onDelete: "CASCADE",
    },
    approver: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "approver_id" },
      onDelete: "CASCADE",
    },
  },
});

module.exports = { LeaveApproval };
