require('dotenv').config();
const Queue = require('bull');
const { AppDataSource } = require('../config/db');
const { createUser } = require('../models/userModel');

const redisConfig = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || 'localhost',
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
};

const userQueue = new Queue('userQueue', { redis: redisConfig });

(async () => {
  try {
    await AppDataSource.initialize();
    userQueue.process(async (job) => {
      const { users } = job.data;
      
      for (const user of users) {
        try {
          await createUser(user);
          console.log(`Created user ${user.email || user.username}`);
        } catch (userError) {
          console.error(`Error creating user:`, user);
        }
      }
    });

    console.log('Worker is now listening for jobs...');
    
  } catch (err) {
    process.exit(1);
  }
})();