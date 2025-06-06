const {
  getAllUsers: repoGetAllUsers,
  createUser: repoCreateUser,
  getUserByEmail: repoGetUserByEmail,
  getUserById: repoGetUserById,
  updatePasswordById:repoUpdatePasswordById
} = require('../repositories/UserRepository');

// Get all users from the database
const getAllUsers = async () => {
  return repoGetAllUsers();
};

// Create a new user in the database
const createUser = async ({name, email, password, roleId, managerId}) => {
  return repoCreateUser({name, email, password, roleId, managerId});
};

// Get a user by their email address
const getUserByEmail = async (email) => {
  return repoGetUserByEmail(email);
};

// Get a user by their ID
const getUserById = async (id) => {
  return repoGetUserById(id);
};

//Update Old Password to New
const updatePasswordByid = async(userId,password) =>{
  return repoUpdatePasswordById(userId,password)
}

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  updatePasswordByid,
  getUserById
};
