const { AppDataSource } = require('../config/db');
const { Role } = require('../entities/Role');

const rolesRepo = AppDataSource.getRepository(Role);

const roles = [
    { id: 1, name: "admin",level:null},
    { id: 2, name: "hr",level:1},
    { id: 3, name: "manager",level:2},
    { id: 4, name: "employee",level:3}
  ];
  
async function seedRoles() {
    const existingRoles = await rolesRepo.find();
    if (existingRoles.length === 0) {
        for (const role of roles) {
            const newRole = rolesRepo.create(role);
            await rolesRepo.save(newRole);
        }

        console.log('Roles data seeded successfully!');
    } else {
        console.log('Data exist. Skipping Roles seeding..');
    }
}

module.exports = seedRoles;