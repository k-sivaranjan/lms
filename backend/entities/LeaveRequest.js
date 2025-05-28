const { EntitySchema } = require("typeorm");

const LeaveStatus = {
  PENDING: 'Pending',
  PENDING_L1: 'Pending (L1)',
  PENDING_L2: 'Pending (L2)',
  PENDING_L3: 'Pending (L3)',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const HalfDayType = {
  FIRST_HALF: 'AM',
  SECOND_HALF: 'PM',
};

// Schema for the LeaveRequest entity
const LeaveRequest = new EntitySchema({
  name: "LeaveRequest",
  tableName: "leave_requests",
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
    managerId: {
      name: "manager_id",
      type: Number,
    },
    leaveTypeId: {
      name: "leave_type_id",
      type: Number,
    },
    startDate: {
      name: "start_date",
      type: "date",
    },
    endDate: {
      name: "end_date",
      type: "date",
    },
    isHalfDay: {
      name: "is_half_day",
      type: Boolean,
      default: false,
    },
    halfDayType: {
      name: "half_day_type",
      type: "enum",
      enum: Object.values(HalfDayType),
      nullable: true,
    },
    reason: {
      type: String,
      nullable: true,
    },
    status: {
      type: "enum",
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
    },
    finalApprovalLevel: {
      name: "final_approval_level",
      type: Number,
      default: 1,
    },
    totalDays: {
      name: "total_days",
      type: "decimal",
      precision: 4,
      scale: 2,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      inverseSide: "leaveRequests",
    },
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: { name: "leave_type_id" },
      inverseSide: "leaveRequests",
    },
  },
});

module.exports = { LeaveRequest, LeaveStatus, HalfDayType };