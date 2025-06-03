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
      enum: UserRole,
      unique: true,
    },
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
