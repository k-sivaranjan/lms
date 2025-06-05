const { AppDataSource } = require('../config/db');
const { LeavePolicy } = require('../entities/LeavePolicy');

const leavePolicyRepo = AppDataSource.getRepository(LeavePolicy);

const leaveAccruals = [
  { accrual_per_year: 8, role: { id: 2 }, leaveType: { id: 1 } },
  { accrual_per_year: 5, role: { id: 2 }, leaveType: { id: 2 } },
  { accrual_per_year: 10, role: { id: 2 }, leaveType: { id: 3 } },
  { accrual_per_year: 2,  role: { id: 2 }, leaveType: { id: 9 } },
  { accrual_per_year: 0,  role: { id: 2 }, leaveType: { id: 10 } },
  { accrual_per_year: 8, role: { id: 3 }, leaveType: { id: 1 } },
  { accrual_per_year: 5, role: { id: 3 }, leaveType: { id: 2 } },
  { accrual_per_year: 10, role: { id: 3 }, leaveType: { id: 3 } },
  { accrual_per_year: 2,  role: { id: 3 }, leaveType: { id: 9 } },
  { accrual_per_year: 0,  role: { id: 3 }, leaveType: { id: 10 } },
  { accrual_per_year: 0,  role: { id: 4 }, leaveType: { id: 10 } },
];

async function seedLeavePolicy() {
    const existingLeavePolicy = await leavePolicyRepo.find();
    if (existingLeavePolicy.length === 0) {
        for (const policy of leaveAccruals) {
            const leavePolicy = leavePolicyRepo.create(policy);
            await leavePolicyRepo.save(leavePolicy);
        }

        console.log('Leave Policy data seeded successfully!');
    } else {
        console.log('Data exist. Skipping Leave Policy seeding..');
    }
}

module.exports = seedLeavePolicy;