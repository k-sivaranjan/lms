const { AppDataSource } = require('../config/db');
const { LeaveType } = require('../entities/LeaveType');

const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

// Get all leave types (excluding soft-deleted ones)
const getAllLeaveTypes = async () => leaveTypeRepo.find({where:{deletedAt:null}});

// Get a single leave type by ID
const getLeaveTypeById = async (id) => leaveTypeRepo.findOne({ where: { id ,deletedAt:null } });

// Create a new leave type
const createLeaveType = async ({ name, maxPerYear, multiApprover }) => {
  const leaveType = leaveTypeRepo.create({ name, maxPerYear, multiApprover });
  return leaveTypeRepo.save(leaveType);
};

// Update an existing leave type
const updateLeaveType = async ({ id, name, maxPerYear, multiApprover = 1 }) => {
  const leaveType = await leaveTypeRepo.findOne({ where: { id } });
  if (!leaveType) return null;
  leaveType.name = name;
  leaveType.maxPerYear = maxPerYear;
  leaveType.multiApprover = multiApprover;
  return leaveTypeRepo.save(leaveType);
};

// Soft delete a leave type
const deleteLeaveType = async (id) => {
  const result = await leaveTypeRepo.softDelete(id);
  return result.affected !== 0;
};

module.exports = {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
};
