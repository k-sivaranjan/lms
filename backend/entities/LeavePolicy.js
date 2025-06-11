const { EntitySchema } = require("typeorm");

const LeavePolicy = new EntitySchema({
  name: "LeavePolicy",
  tableName: "leave_policy",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    accrual_per_year: {
      type: "int",
    },
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true, 
    }
  },
  relations: {
    role: {
      type: "many-to-one",
      target: "Role",
      joinColumn: { name: "role_id" },
      onDelete: "CASCADE",
    },
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: { name: "leave_type_id" },
      onDelete: "CASCADE",
    },
  },
});

module.exports = { LeavePolicy };