const { EntitySchema } = require("typeorm");

const LeaveStatus = {
  PENDING: 1,
  PENDING_L1: 2,
  PENDING_L2: 3,
  PENDING_L3: 4,
  APPROVED: 5,
  REJECTED: 6,
  CANCELLED: 7,
};

const HalfDayType = {
  FIRST_HALF: 'AM',
  SECOND_HALF: 'PM',
};

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
      nullable: true,
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
      type: "int",
      default: LeaveStatus.PENDING,
    },
    totalDays: {
      name: "total_days",
      type: "decimal",
      precision: 4,
      scale: 2,
    },
    finalApprovalLevel: {
      name: "final_approval_level",
      type: "int",
      default: 1,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true, 
    }
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      inverseSide: "leaveRequests",
      onDelete: "CASCADE",
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