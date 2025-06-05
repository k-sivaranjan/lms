const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const { LeaveType } = require('../entities/LeaveType');
const { LeaveBalance } = require('../entities/LeaveBalance');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userRepo = AppDataSource.getRepository(User);
const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

const users = [
  {
    name: 'admin1',
    email: 'admin1@gmail.com',
    password: 'admin1password',
    roleId: 1,
    managerId: null,
    created_at: null
  },
  {
    name: 'manager1',
    email: 'manager1@gmail.com',
    password: 'manager1password',
    roleId: 3,
    managerId: 6,
    created_at: null
  },
  {
    name: 'user1',
    email: 'user1@gmail.com',
    password: 'user1password',
    roleId: 4,
    managerId: 2,
    created_at: null
  },
  {
    name: 'manager2',
    email: 'manager2@gmail.com',
    password: 'manager2password',
    roleId: 3,
    managerId: 6,
    created_at: null
  },
  {
    name: 'user2',
    email: 'user2@gmail.com',
    password: 'user2password',
    roleId: 4,
    managerId: 4,
    created_at: null
  },
  {
    name: 'hr1',
    email: 'hr1@gmail.com',
    password: 'hr1password',
    roleId: 2,
    managerId: 1,
    created_at: null
  }
];

async function seedUsers() {
  const existingUsers = await userRepo.find();
  if (existingUsers.length > 0) {
    console.log('Data exist. Skipping users seeding..');
    return;
  }

  const savedUsersMap = {};

  for (const { managerId, password, ...userData } of users) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo.create({
      ...userData,
      password: hashedPassword,
      created_at: new Date(),
    });
    const savedUser = await userRepo.save(user);
    savedUsersMap[savedUser.email] = savedUser;
  }

  for (const userData of users) {
    if (userData.managerId !== null) {
      const user = await userRepo.findOneBy({ email: userData.email });
      if (user) {
        user.managerId = userData.managerId;
        await userRepo.save(user);
      }
    }
  }

  const leaveTypes = await leaveTypeRepo.find();
  const currentYear = new Date().getFullYear();

  for (const user of await userRepo.find()) {
    const leaveBalances = leaveTypes.map((lt) =>
      leaveBalanceRepo.create({
        userId: user.id,
        leaveTypeId: lt.id,
        year: currentYear,
        balance: lt.maxPerYear,
        used: 0,
      })
    );
    await leaveBalanceRepo.save(leaveBalances);
  }

  console.log('User data and leave balances seeded successfully!');
}

module.exports = seedUsers;