const { LeaveType } = require('../entities/LeaveType');
const { AppDataSource } = require('../config/db');

class LeaveTypeRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(LeaveType);
  }

  async getAllLeaveTypes() {
    return this.repository.find();
  }

  async getLeaveTypeById(id) {
    return this.repository.findOne({ where: { id } });
  }

  async createLeaveType(name, maxPerYear, multiApprover = 1) {
    const leaveType = this.repository.create({
      name,
      maxPerYear,
      multiApprover
    });
    return this.repository.save(leaveType);
  }

  async updateLeaveType(id, name, maxPerYear, multiApprover = 1) {
    const leaveType = await this.repository.findOne({ where: { id } });
    if (!leaveType) return null;
    leaveType.name = name;
    leaveType.maxPerYear = maxPerYear;
    leaveType.multiApprover = multiApprover;
    return this.repository.save(leaveType);
  }

  async deleteLeaveType(id) {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

module.exports = LeaveTypeRepository;