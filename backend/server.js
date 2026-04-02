const connectDB = require('./config/db');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use('/api/task', require('./routes/taskRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/member', require('./routes/memberRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;