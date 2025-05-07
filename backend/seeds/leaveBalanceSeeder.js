const { AppDataSource } = require('../config/db');
const { LeaveBalance } = require('../entities/LeaveBalance');

const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

const leaveBalances = [
    // User 1
    { userId: 1, leaveTypeId: 1, year: 2025, balance: 12, used: 1 },
    { userId: 1, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 1, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 1, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 1, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 1, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 1, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 2
    { userId: 2, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 2, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 2, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 2, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 2, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 2, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 2, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 3
    { userId: 3, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 3, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 3, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 3, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 3, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 3, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 3, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 4
    { userId: 4, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 4, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 4, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 4, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 4, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 4, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 4, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 5
    { userId: 5, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 5, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 5, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 5, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 5, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 5, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 5, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 6
    { userId: 6, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 6, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 6, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 6, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 6, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 6, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 6, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 7
    { userId: 7, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 7, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 7, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 7, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 7, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 7, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 7, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 8
    { userId: 8, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 8, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 8, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 8, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 8, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 8, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 8, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 9
    { userId: 9, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 9, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 9, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 9, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 9, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 9, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 9, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 10
    { userId: 10, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 10, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 10, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 10, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 10, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 10, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 10, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 15
    { userId: 15, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 15, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 15, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 15, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 15, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 15, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 15, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 16
    { userId: 16, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 16, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 16, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 16, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 16, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 16, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 16, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },

    // User 17
    { userId: 17, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 17, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 17, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 17, leaveTypeId: 4, year: 2025, balance: 90, used: 0 },
    { userId: 17, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 17, leaveTypeId: 9, year: 2025, balance: 0, used: 0 },
    { userId: 17, leaveTypeId: 10, year: 2025, balance: 0, used: 0 },
];

async function seedLeaveBalances() {
    const existingLeaveBalances = await leaveBalanceRepo.find();
    if (existingLeaveBalances.length === 0) {
        for (const leave of leaveBalances) {
            const leaveBalance = leaveBalanceRepo.create(leave);
            await leaveBalanceRepo.save(leaveBalance);
        }

        console.log('Leave Balance data seeded successfully!');
    } else {
        console.log('Data already exist. Skipping Leave Balances seeding');
    }
}

module.exports = seedLeaveBalances;