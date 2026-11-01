const userService = require('../app/services/userService');

describe('User Service', () => {
  test('createUser adds a valid user and defaults active to false', async () => {
    const newUser = { name: 'Jane Doe', email: 'jane@example.com' };
    const created = await userService.createUser(newUser);
    expect(created).toEqual({ ...newUser, active: false });
  });

  test('createUser accepts valid phone number starting with +1', async () => {
    const newUser = { name: 'Jane Doe', email: 'jane@example.com', phone: '+11234567890' };
    const created = await userService.createUser(newUser);
    expect(created).toEqual({ ...newUser, active: false });
  });

  test('createUser accepts valid address fields', async () => {
    const newUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      addressLine1: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
    };
    const created = await userService.createUser(newUser);
    expect(created).toEqual({ ...newUser, active: false });
  });

  test('createUser rejects invalid postal code', async () => {
    await expect(
      userService.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com',
        addressLine1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: 'ABCDE',
      })
    ).rejects.toThrow('User postal code must be a valid ZIP code like 12345 or 12345-6789');
  });

  test('createUser rejects phone number not starting with +1', async () => {
    await expect(userService.createUser({ name: 'Jane Doe', email: 'jane@example.com', phone: '1234567890' })).rejects.toThrow('User phone number must start with +1 followed by 10 digits');
  });

  test('createUser rejects missing phone digits after +1', async () => {
    await expect(userService.createUser({ name: 'Jane Doe', email: 'jane@example.com', phone: '+1' })).rejects.toThrow('User phone number must start with +1 followed by 10 digits');
  });

  test('createUser rejects missing name', async () => {
    await expect(userService.createUser({ email: 'jane@example.com' })).rejects.toThrow('User name is required');
  });

  test('createUser rejects invalid email missing @ symbol', async () => {
    await expect(userService.createUser({ name: 'Jane Doe', email: 'jane.example.com' })).rejects.toThrow("Invalid email format: must include '@' symbol and a valid domain");
  });

  test('createUser rejects invalid email without valid domain', async () => {
    await expect(userService.createUser({ name: 'Jane Doe', email: 'jane@' })).rejects.toThrow("Invalid email format: must include '@' symbol and a valid domain");
  });
});
