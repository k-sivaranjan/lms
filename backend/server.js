const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const seedUsers = require('./seeds/userSeeder');
const seedLeaveTypes = require('./seeds/leaveTypeSeeder');
const seedLeaveBalances = require('./seeds/leaveBalanceSeeder');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const { initializeDatabase } = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);

const PORT = process.env.PORT || 5000;

initializeDatabase().then(async () => {
  await seedUsers();
  await seedLeaveTypes()
  await seedLeaveBalances();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});
