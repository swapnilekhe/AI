const userModel = require('../models/userModel');
const validator = require('../utils/validator');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.fetchUsers = async () => {
  return userModel.getAll();
};

exports.fetchActiveUsers = async () => {
  return userModel.getActiveUsers();
};

exports.createUser = async (userData) => {
  validator.validateUser(userData);

  if (!emailPattern.test(userData.email)) {
    throw new Error("Invalid email format: must include '@' symbol and a valid domain, e.g. user@example.com");
  }

  const user = {
    active: false,
    ...userData,
  };
  return userModel.add(user);
};
