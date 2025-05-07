const { AppDataSource } = require('../config/db');
const { LeaveType } = require('../entities/LeaveType');

const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

const getAllLeaveTypes = async () => leaveTypeRepo.find();

const getLeaveTypeById = async (id) => leaveTypeRepo.findOne({ where: { id } });

const createLeaveType = async (name, maxPerYear, multiApprover = 1) => {
  const leaveType = leaveTypeRepo.create({ name, maxPerYear, multiApprover });
  return leaveTypeRepo.save(leaveType);
};

const updateLeaveType = async (id, name, maxPerYear, multiApprover = 1) => {
  const leaveType = await leaveTypeRepo.findOne({ where: { id } });
  if (!leaveType) return null;
  leaveType.name = name;
  leaveType.maxPerYear = maxPerYear;
  leaveType.multiApprover = multiApprover;
  return leaveTypeRepo.save(leaveType);
};

const deleteLeaveType = async (id) => {
  const result = await leaveTypeRepo.delete(id);
  return result.affected !== 0;
};

module.exports = {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
};
