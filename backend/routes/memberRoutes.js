const express = require('express');
const TeamMember = require('../models/member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/authMiddleware'); // 🔥 IMPORT
const router = express.Router();

// ✅ REGISTER TEAM MEMBER (FIXED)
router.post('/register', authMiddleware, async (req, res) => {
    try {
        const { name, email, password, skills, capacityHours } = req.body;

        // 🔥 GET MANAGER ID FROM TOKEN
        const managerId = req.user.id;

        const hashPassword = await bcrypt.hash(password, 10);

        const formattedSkills = (skills || []).map(skill => ({
            name: skill,
            level: 10
        }));

        const member = await TeamMember.create({
            name,
            email,
            password: hashPassword,
            skills: formattedSkills,
            capacityHours: capacityHours || 0,
            managerId   // ✅ always correct now
        });

        res.json(member);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
});


// ✅ LOGIN
router.post('/login', async(req,res) => {
    const {email, password} = req.body;

    const member = await TeamMember.findOne({email});

    if(!member) {
        return res.status(400).json({error: 'Team member not found'});
    }

    const isPasswordValid = await bcrypt.compare(password, member.password);

    if(!isPasswordValid) {
        return res.status(400).json({error: 'Invalid password'});
    }

    const token = jwt.sign(
        { id: member._id, role: member.role },
        "taskweave_secret"
    );

    res.json({token,id: member._id});
});


// ✅ GET MEMBERS (OPTIONAL FILTER)
router.get('/', async(req,res) => {
   const members = await TeamMember.find();
   res.json(members);
});

module.exports = router;