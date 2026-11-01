// Example user model placeholder
// Replace this with your ORM or database schema definition.

const users = [];

exports.getAll = async () => users;

exports.getActiveUsers = async () => users.filter((user) => user.active === true);

exports.add = async (user) => {
  const normalizedUser = {
    active: false,
    ...user,
  };
  users.push(normalizedUser);
  return normalizedUser;
};
