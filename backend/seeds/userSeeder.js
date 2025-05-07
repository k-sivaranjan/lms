const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const userRepo = AppDataSource.getRepository(User);


const users = [
  {
    name: 'manager1',
    email: 'manager1@gmail.com',
    password: 'manager1password',
    role: 'manager',
    manager_id: 15,
    created_at: '2025-04-16 17:59:21'
  },
  {
    name: 'user1',
    email: 'user1@gmail.com',
    password: 'user1password',
    role: 'employee',
    manager_id: 1,
    created_at: '2025-04-16 18:02:02'
  },
  {
    name: 'manager2',
    email: 'manager2@gmail.com',
    password: 'manager2password',
    role: 'manager',
    manager_id: 15,
    created_at: '2025-04-17 09:30:20'
  },
  {
    name: 'manager3',
    email: 'manager3@gmail.com',
    password: 'manager3password',
    role: 'manager',
    manager_id: 16,
    created_at: '2025-04-17 09:30:20'
  },
  {
    name: 'manager4',
    email: 'manager4@gmail.com',
    password: 'manager4password',
    role: 'manager',
    manager_id: 16,
    created_at: '2025-04-17 09:30:20'
  },
  {
    name: 'manager5',
    email: 'manager5@gmail.com',
    password: 'manager5password',
    role: 'manager',
    manager_id: 16,
    created_at: '2025-04-17 09:30:20'
  },
  {
    name: 'user2',
    email: 'user2@gmail.com',
    password: 'user2password',
    role: 'employee',
    manager_id: 3,
    created_at: '2025-04-17 09:32:48'
  },
  {
    name: 'user3',
    email: 'user3@gmail.com',
    password: 'user3password',
    role: 'employee',
    manager_id: 4,
    created_at: '2025-04-17 09:32:48'
  },
  {
    name: 'user4',
    email: 'user4@gmail.com',
    password: 'user4password',
    role: 'employee',
    manager_id: 5,
    created_at: '2025-04-17 09:32:48'
  },
  {
    name: 'user5',
    email: 'user5@gmail.com',
    password: 'user5password',
    role: 'employee',
    manager_id: 1,
    created_at: '2025-04-17 09:32:48'
  },
  {
    name: 'admin1',
    email: 'admin1@gmail.com',
    password: 'admin1password',
    role: 'admin',
    manager_id: null,
    created_at: '2025-04-18 10:56:42'
  },
  {
    name: 'hr1',
    email: 'hr1@gmail.com',
    password: 'hr1password',
    role: 'hr',
    manager_id: 11,
    created_at: '2025-04-21 15:09:55'
  },
  {
    name: 'hr2',
    email: 'h2@gmail.com',
    password: 'hr2password',
    role: 'hr',
    manager_id: 11,
    created_at: '2025-04-21 15:09:55'
  },
  {
    name: 'hr3',
    email: 'hr3@gmail.com',
    password: 'hr3password',
    role: 'hr',
    manager_id: 11,
    created_at: '2025-04-23 10:10:00'
  }
];

async function seedUsers() {
  const existingUsers = await userRepo.find();
  if (existingUsers.length === 0) {
    for (const userData of users) {
      const user = userRepo.create(userData);
      await userRepo.save(user);
    }

    console.log('User data seeded successfully!');
  } else {
    console.log('Users already exist. Skipping users seeding.');
  }
}

module.exports = seedUsers;