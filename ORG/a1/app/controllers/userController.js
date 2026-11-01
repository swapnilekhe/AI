const userService = require('../services/userService');

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch users' });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await userService.fetchActiveUsers();
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch active users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const createdUser = await userService.createUser(req.body);
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
