const { DataSource } = require('typeorm') ;
const dotenv = require('dotenv') ;
const { User } = require('../entities/User') ;
const { LeaveType } = require('../entities/LeaveType') ;
const { LeaveBalance } = require('../entities/LeaveBalance') ;
const { LeaveRequest } = require('../entities/LeaveRequest') ;

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, LeaveType, LeaveBalance, LeaveRequest],
  migrations: ['src/migrations/**/*.ts'],
});

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