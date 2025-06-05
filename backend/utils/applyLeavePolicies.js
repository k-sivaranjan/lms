const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const { LeavePolicy } = require('../entities/LeavePolicy');
const { LeaveBalance } = require('../entities/LeaveBalance');

const currentYear = new Date().getFullYear();

async function applyLeavePolicies() {

  const userRepo = AppDataSource.getRepository(User);
  const policyRepo = AppDataSource.getRepository(LeavePolicy);
  const balanceRepo = AppDataSource.getRepository(LeaveBalance);

  const users = await userRepo.find({ relations: ["role"] });
  const policies = await policyRepo.find({ relations: ["role", "leaveType"] });

  for (const user of users) {

    const userPolicies = policies.filter(p => p.role.id === user.role.id);

    for (const policy of userPolicies) {
      
      const existing = await balanceRepo.findOne({
        where: {
          user: { id: user.id },
          leaveType: { id: policy.leaveType.id },
          year: currentYear
        },
        relations: ["user", "leaveType"]
      });

      if (!existing) {
        const previousYear = currentYear - 1;

        const previousBalance = await balanceRepo.findOne({
          where: {
            user: { id: user.id },
            leaveType: { id: policy.leaveType.id },
            year: previousYear,
          },
          relations: ["user", "leaveType"],
        });

        let carryForward = 0;

        if (previousBalance) {
          carryForward = Math.min(policy.accrual_per_year, previousBalance.balance);
        }

        const newBalanceValue = policy.leaveType.maxPerYear + carryForward;

        const newBalance = balanceRepo.create({
          user: user,
          leaveType: policy.leaveType,
          year: currentYear,
          balance: newBalanceValue,
          used: 0,
        });

        await balanceRepo.save(newBalance);

        console.log(`Leave balance created for user ${user.id}, type ${policy.leaveType.name}, carried forward ${unusedLeaves} days.`);
      }
    }
  }
}

module.exports = applyLeavePolicies;