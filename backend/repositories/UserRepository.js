const { Repository } = require('typeorm');
const { User } = require('../entities/User');
const { AppDataSource } = require('../config/db');

class UserRepository {  // Correct class definition
  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async getAllUsers() {
    return this.repository.find();
  }

  async createUser(name, email, password, role, managerId = null) {
    const user = this.repository.create({
      name,
      email,
      password,
      role,
      managerId
    });
    
    return this.repository.save(user);
  }

  async getUserByEmail(email) {
    return this.repository.findOne({ where: { email } });
  }

  async getUserById(id) {
    return this.repository.findOne({ where: { id } });
  }
}

module.exports = UserRepository; 
