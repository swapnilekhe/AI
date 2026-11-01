const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./app/routes/userRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
