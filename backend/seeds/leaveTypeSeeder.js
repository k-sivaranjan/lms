const { AppDataSource } = require('../config/db');
const { LeaveType } = require('../entities/LeaveType');

const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

const leaveTypes = [
    { id: 1, name: "Casual Leave", max_per_year: 12, multi_approver: 1 },
    { id: 2, name: "Sick Leave", max_per_year: 10, multi_approver: 1 },
    { id: 3, name: "Paid Leave", max_per_year: 15, multi_approver: 2 },
    { id: 4, name: "Maternity Leave", max_per_year: 90, multi_approver: 3 },
    { id: 5, name: "Paternity Leave", max_per_year: 15, multi_approver: 3 },
    { id: 9, name: "Emergency Leave", max_per_year: 0, multi_approver: 0 },
    { id: 10, name: "Loss of Pay", max_per_year: 0, multi_approver: 1 }
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
        console.log('Data already exist. Skipping Leave Types seeding');
    }
}

module.exports = seedLeaveTypes;