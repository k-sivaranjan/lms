const { EntitySchema } = require("typeorm");

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
      nullable: true,
    },
    used: {
      type: "float",
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
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      inverseSide: "leaveBalances",
    },
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: {
        name: "leave_type_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      inverseSide: "leaveBalances",
    },
  },
});

module.exports = { LeaveBalance };