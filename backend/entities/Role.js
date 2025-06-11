const { EntitySchema } = require("typeorm");

const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

const Role = new EntitySchema({
  name: "Role",
  tableName: "roles",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: "enum",
      enum: Object.values(UserRole),
      unique: true,
    },
    level: {
      type: Number,
      nullable: true,
    },
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true, 
    }
  },
  relations: {
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "role",
    },
  },
});

module.exports = { Role };