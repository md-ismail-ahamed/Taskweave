const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Manager = require('../models/manager');
const router = express.Router();

// Register a new manager
router.post('/register', async(req,res) => {
     const {name,email,password} = req.body;
     const hashPassword = await bcrypt.hash(password, 10);

     const manager = await Manager.create({
        name,
        email,
        password: hashPassword
     });

     res.json(manager);
});

// Login a manager
router.post('/login', async(req,res) => {
    const {email, password} = req.body;

    const manager = await Manager.findOne({email});

    if(!manager) {
        return res.status(400).json({error: 'Manager not found'});
    }

    const isPassowrdValid = await bcrypt.compare(password, manager.password);

    if(!isPassowrdValid) {
        return res.json({error: 'Invalid password'});
    }

    const token = jwt.sign({id: manager._id, role: manager.role}, "taskweave_secret");

    // 🔥 ADD id HERE
    res.json({
        token,
        id: manager._id,
    });
});

module.exports = router;