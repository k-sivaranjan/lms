const { Repository } = require('typeorm') ;
const { LeaveBalance } = require('../entities/LeaveBalance') ;
const { AppDataSource } = require('../config/db') ;

class LeaveBalanceRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(LeaveBalance);
  }

  async getLeaveBalanceByUserAndYear(userId, year) {
    return this.repository.find({
      where: { userId, year },
      relations: ['leaveType']
    });
  }

  async updateLeaveBalance(id, balance, used) {
    const leaveBalance = await this.repository.findOne({ where: { id } });
    
    if (!leaveBalance) {
      return null;
    }
    
    leaveBalance.balance = balance;
    leaveBalance.used = used;
    
    return this.repository.save(leaveBalance);
  }
  
  async updateLeaveBalanceByUserAndType(userId, leaveTypeId, year, balanceChange, usedChange) {
    const leaveBalance = await this.repository.findOne({
      where: { userId, leaveTypeId, year }
    });
  
    if (!leaveBalance) {
      return null;
    }
  
    leaveBalance.balance += Number(balanceChange);
    leaveBalance.used += Number(usedChange);
  
    return this.repository.save(leaveBalance);
  }
  

  async createLeaveBalance(userId, leaveTypeId, year, balance, used = 0) {
    const leaveBalance = this.repository.create({
      userId,
      leaveTypeId,
      year,
      balance,
      used
    });
    
    return this.repository.save(leaveBalance);
  }
}

module.exports = LeaveBalanceRepository;