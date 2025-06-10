const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const cron = require("node-cron");
const applyLeavePolicies = require("./utils/applyLeavePolicies");

const seedUsers = require('./seeds/userSeeder');
const seedLeaveTypes = require('./seeds/leaveTypeSeeder');
const seedLeavePolicy = require('./seeds/leavePolicySeeder');
const seedRoles = require('./seeds/roleSeeder');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const { initializeDatabase } = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
// app.use(cors({origin: "https://lms-leave.vercel.app"}));

app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);

const PORT = process.env.PORT || 5000;

initializeDatabase().then(async () => {
  await seedRoles();
  await seedLeaveTypes();
  await seedLeavePolicy()
  await seedUsers();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  console.log("Cron scheduler initialized");

  cron.schedule("0 0 1 1 *", async () => {
    await applyLeavePolicies();
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});
