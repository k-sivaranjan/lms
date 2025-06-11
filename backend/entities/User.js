const { EntitySchema } = require("typeorm");

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
    managerId: {
      name: "manager_id",
      type: Number,
      nullable: true,
    },
    roleId: {
      name: "role_id",
      type: Number,
      nullable: false,
    },
    created_at: {
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
    manager: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "manager_id",
      },
      inverseSide: "directReports",
      nullable: true,
    },
    directReports: {
      type: "one-to-many",
      target: "User",
      inverseSide: "manager",
    },

    role: {
      type: "many-to-one",
      target: "Role",
      joinColumn: {
        name: "role_id",
      },
      nullable: false,
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

module.exports = { User };