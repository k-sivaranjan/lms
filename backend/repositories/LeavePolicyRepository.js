const { AppDataSource } = require('../config/db');
const { LeavePolicy } = require('../entities/LeavePolicy');
const { Role } = require('../entities/Role');

const leavePolicyRepo = AppDataSource.getRepository(LeavePolicy);
const roleRepo = AppDataSource.getRepository(Role);

// Get leave policies for a given role
const getLeavePoliciesByRoleId = async (roleId) => {
  return leavePolicyRepo.find({
    where: {
      role: { id: roleId },
      deletedAt: null
    },
    relations: ['role', 'leaveType']
  });
};

// Get all latest leave policies
const getAllPolicy = async () => {
  const allPolicies = await leavePolicyRepo.find({
    where: {
      deletedAt: null,
    },
    relations: ['leaveType', 'role'],
  });

  const leaveTypeMap = new Map();

  for (const policy of allPolicies) {
    const ltId = policy.leaveType.id;
    const existing = leaveTypeMap.get(ltId);

    if (!existing || policy.role.id > existing.maxApplicableRoleId) {
      leaveTypeMap.set(ltId, {
        leaveTypeId: ltId,
        leaveTypeName: policy.leaveType.name,
        maxPerYear: policy.leaveType.maxPerYear,
        multiApprover: policy.leaveType.multiApprover,
        accrualPerYear: policy.accrual_per_year,
        maxApplicableRoleId: policy.role.id,
      });
    }
  }

  return Array.from(leaveTypeMap.values());
};

// Create leave policy for role and all below roles (excluding admin)
const createLeavePolicy = async ({ id, accrual_per_year, roleId }) => {
  const validRoles = await roleRepo
    .createQueryBuilder("role")
    .select("role.id")
    .where("role.id <= :roleId", { roleId })
    .andWhere("role.id != 1")
    .getRawMany();

  const roleIdsToInsert = validRoles.map(r => r.role_id);

  const insertData = roleIdsToInsert.map(rId => ({
    leaveType: id,
    role: rId,
    accrual_per_year
  }));

  if (insertData.length > 0) {
    await leavePolicyRepo
      .createQueryBuilder()
      .insert()
      .values(insertData)
      .execute();
  }

  return { inserted: insertData.length };
};

// Update existing policies and fill missing
const updateLeave = async ({ id, accrual_per_year, roleId }) => {
  await leavePolicyRepo
    .createQueryBuilder()
    .update()
    .set({ accrual_per_year })
    .where("leave_type_id = :leaveTypeId", { leaveTypeId: id })
    .andWhere("role_id <= :roleId", { roleId })
    .andWhere("role_id > 1")
    .execute();

  const existingRoles = await leavePolicyRepo
    .createQueryBuilder()
    .select("role_id")
    .where("leave_type_id = :leaveTypeId", { leaveTypeId: id })
    .andWhere("role_id <= :roleId", { roleId })
    .getRawMany();

  const existingRoleIds = existingRoles.map(row => row.role_id);

  const validRoles = await roleRepo
    .createQueryBuilder("role")
    .select("role.id")
    .where("role.id <= :roleId", { roleId })
    .andWhere("role.id != 1")
    .getRawMany();

  const allRequiredRoleIds = validRoles.map(r => r.role_id);

  const missingRoleIds = allRequiredRoleIds.filter(
    id => !existingRoleIds.includes(id)
  );

  let insertedCount = 0;
  if (missingRoleIds.length > 0) {
    const insertData = missingRoleIds.map(roleIdToInsert => ({
      leaveType: id,
      role: roleIdToInsert,
      accrual_per_year,
    }));

    const insertResult = await leavePolicyRepo
      .createQueryBuilder()
      .insert()
      .values(insertData)
      .execute();

    insertedCount = insertResult.identifiers.length;
  }

  // Soft delete higher roles
  const toDelete = await leavePolicyRepo
    .createQueryBuilder("policy")
    .leftJoinAndSelect("policy.role", "role")
    .leftJoinAndSelect("policy.leaveType", "leaveType")
    .where("policy.leaveType = :id", { id })
    .andWhere("role.id > :roleId", { roleId })
    .getMany();

  if (toDelete.length > 0) {
    for (const policy of toDelete) {
      await leavePolicyRepo.softDelete(policy.id);
    }
  }

  return {
    updated: true,
    inserted: insertedCount,
    deleted: toDelete.length,
  };
};

// Soft delete specific policy
const softDeletePolicy = async (id) => {
  const result = await leavePolicyRepo.softDelete({ leaveType: { id } });
  return result.affected !== 0;
};

module.exports = {
  getLeavePoliciesByRoleId,
  getAllPolicy,
  createLeavePolicy,
  updateLeave,
  softDeletePolicy
};
