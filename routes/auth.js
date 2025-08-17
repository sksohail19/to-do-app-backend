const express = require("express")
const { body, validationResult } = require("express-validator");
const User = require("../models/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET

router.post("/signup", [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 7}).withMessage('Password must be at least 7 characters long'),
    body('username').notEmpty().withMessage('Name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {

        const { username, email } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        user = await new User({ username, email, password: hashedPassword });
        await user.save();
        const data = {
            userId: user._id,
            email: user.email,
            username: user.username
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.status(201).json({ authToken, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.post("/login", [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const data = {
            userId: user._id,
            email: user.email,
            username: user.username
        }

        //const payload = { userId: user._id, email: user.email, password: user.password };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.status(200).json({ authToken, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})


module.exports = router;