const { DataSource } = require('typeorm') ;
const dotenv = require('dotenv') ;
const { User } = require('../entities/User') ;
const { Role } = require('../entities/Role') ;
const { LeaveType } = require('../entities/LeaveType') ;
const { LeaveBalance } = require('../entities/LeaveBalance') ;
const { LeavePolicy } = require('../entities/LeavePolicy') ;
const { LeaveRequest } = require('../entities/LeaveRequest') ;
const { LeaveApproval } = require('../entities/LeaveApproval');

dotenv.config();

// Create a TypeORM data source instance
const AppDataSource = new DataSource({
  type: 'mysql',
  url:process.env.DB_CONNECTION_STRING, 
  // host: process.env.DB_HOST,
  // port: parseInt(process.env.DB_PORT || '3306'),
  // username: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  synchronize:false,
  logging: false, 
  entities: [User,Role, LeaveType,LeavePolicy,LeaveApproval, LeaveBalance, LeaveRequest],
  migrations: ['src/migrations/**/*.ts'],
});

// Initialize the database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection successfully established');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
};

module.exports = { AppDataSource, initializeDatabase };