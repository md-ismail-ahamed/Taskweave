const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    requiredSkills: {
        type: [String],
    },
    estimatedHours: {
        type: Number,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamMember',
    },
    projectLink: {
type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

const Task = mongoose.model('Task', tasksSchema);

module.exports = Task;