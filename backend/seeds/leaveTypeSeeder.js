const { AppDataSource } = require('../config/db');
const { LeaveType } = require('../entities/LeaveType');

const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

const leaveTypes = [
    { id: 1, name: "Casual Leave", maxPerYear: 12, multiApprover: 1 },
    { id: 2, name: "Sick Leave", maxPerYear: 10, multiApprover: 1 },
    { id: 3, name: "Paid Leave", maxPerYear: 15, multiApprover: 2 },
    { id: 9, name: "Emergency Leave", maxPerYear: 0, multiApprover: 0 },
    { id: 10, name: "Loss of Pay", maxPerYear: 0, multiApprover: 1 }
  ];
  
async function seedLeaveTypes() {
    const existingLeaveTypes = await leaveTypeRepo.find();
    if (existingLeaveTypes.length === 0) {
        for (const leave of leaveTypes) {
            const leaveTypes = leaveTypeRepo.create(leave);
            await leaveTypeRepo.save(leaveTypes);
        }

        console.log('Leave Types data seeded successfully!');
    } else {
        console.log('Data exist. Skipping Leave Types seeding..');
    }
}

module.exports = seedLeaveTypes;