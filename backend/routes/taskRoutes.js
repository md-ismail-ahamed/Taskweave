const express = require('express');
const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');
const TeamMember = require('../models/member');
const tasks = require('../models/tasks');
const axios = require("axios");

const router = express.Router();


// ✅ CREATE TASK
router.post('/create', authMiddleware, managerOnly, async (req, res) => {
    try {
        const { title, description, requiredSkills, estimatedHours, assignedTo, projectLink } = req.body;

        let memberId = null;

        if (assignedTo) {
            const member = await TeamMember.findById(assignedTo);

            if (!member) {
                return res.status(404).json({ error: "Member not found" });
            }

            memberId = member._id;
        }

        const task = await tasks.create({
            title,
            description,
            requiredSkills,
            estimatedHours,
            assignedTo: memberId,
            projectLink,
        });

        // 🔥 UPDATE WORKLOAD + TASK LIST
        if (memberId) {
            const member = await TeamMember.findById(memberId);

            if (member) {
                member.capacityHours += estimatedHours;
                member.assignedTasks.push(task._id);
                await member.save();
            }
        }

        res.json(task);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Task creation failed" });
    }
});


// ✅ GET TASKS
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role === "member") {
            const myTasks = await tasks.find({
                assignedTo: req.user.id,
                //status: { $ne: "completed" }   // 🔥 hide completed tasks
            });

            return res.json(myTasks);
        }

        const allTasks = await tasks.find();
        res.json(allTasks);

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});


// ✅ AI RECOMMENDATION
router.post("/recommend", authMiddleware, async (req, res) => {
    try {
        const { requiredSkills } = req.body;

        const members = await TeamMember.find({
            managerId: req.user.id
        });

        const formattedMembers = members.map(m => ({
            name: m.name,
            skills: m.skills,
            capacityHours: m.capacityHours || 0
        }));

        const response = await axios.post(
            "http://127.0.0.1:8000/recommend",
            {
                requiredSkills,
                members: formattedMembers
            }
        );

        res.json(response.data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI service error" });
    }
});


// 🔥 FINAL UPDATE STATUS ROUTE
router.put('/update-status/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        const task = await tasks.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // 🔥 IF COMPLETING TASK
        if (status === "completed" && task.assignedTo) {

            const member = await TeamMember.findById(task.assignedTo);

            if (member) {

                // 🔥 REDUCE WORKLOAD
                member.capacityHours -= task.estimatedHours;

                if (member.capacityHours < 0) {
                    member.capacityHours = 0;
                }

                // 🔥 REMOVE TASK FROM MEMBER
                member.assignedTasks = member.assignedTasks.filter(
                    id => id.toString() !== task._id.toString()
                );

                // 🔥 SKILL LEARNING
                task.requiredSkills.forEach(skill => {
                    const existing = member.skills.find(
                        s => s.name.toLowerCase() === skill.toLowerCase()
                    );

                    if (existing) {
                        existing.level += 10;
                    } else {
                        member.skills.push({ name: skill, level: 10 });
                    }
                });

                await member.save();
            }
        }

        task.status = status;
        await task.save();

        res.json({ message: "Task completed + workload updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Status update failed" });
    }
});

module.exports = router;