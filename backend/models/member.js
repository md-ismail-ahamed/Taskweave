const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema ({
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
    skills: [
  {
    name: String,
    level: {
      type: Number,
      default: 10   
    }
  }
],
    capacityHours: {
        type: Number,
    },

   
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manager"
    },

    assignedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    role: {
        type: String,
        default: 'member'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const teamMember = mongoose.model("TeamMember", memberSchema);

module.exports = teamMember;