const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'manager'  
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;   