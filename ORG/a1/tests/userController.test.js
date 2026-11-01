const request = require('supertest');
const express = require('express');
const userRoutes = require('../app/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Controller', () => {
  test('GET /api/users returns 200 and JSON', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });

  test('GET /api/users/active returns 200 and JSON', async () => {
    const response = await request(app).get('/api/users/active');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });
});
