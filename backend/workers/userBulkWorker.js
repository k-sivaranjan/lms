require('dotenv').config();
const Queue = require('bull');
const { AppDataSource } = require('../config/db');
const { createUser } = require('../models/userModel');

const userQueue = new Queue('userQueue', {
  redis: { port: 6379, host: '127.0.0.1' }
});

// Handle DB connection and queue processing
(async () => {
  try {
    await AppDataSource.initialize();
    
    userQueue.process(async (job, done) => {
      const { users } = job.data;
      
      try {
        // Process users in the chunk
        for (const user of users) {
          const { name, email, password, role, manager_id } = user;
          await createUser(name, email, password, role, manager_id || null);
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