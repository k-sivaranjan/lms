require('dotenv').config();
const Queue = require('bull');
const { AppDataSource } = require('../config/db');
const { createUser } = require('../models/userModel');

const userQueue = new Queue('userQueue', {
  redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST,password:process.env.REDIS_PASSWORD } 
});

(async () => {
  try {
    await AppDataSource.initialize();
    
    userQueue.process(async (job, done) => {
      const { users } = job.data;
      
      try {
        for (const user of users) {
          await createUser(user);
        }
        done();
      } catch (err) {
        done(err);
      }
    });
    
  } catch (err) {
    process.exit(1);
  }
})();