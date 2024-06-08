const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Secret key for JWT from .env
const jwtSecret = process.env.GB_SEC;

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        // Create new user instance
        user = new User({ name, email, password });

        // Save the user (password hashing is done via pre-save hook)
        await user.save();

        // Create and return token (using the method from User model)
        const token = user.getSignedJwtToken();
        res.status(201).json({ token });

    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: messages });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Login a user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and get password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password (using the method from User model)
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Send token response
        const token = user.getSignedJwtToken();
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user data
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user data
exports.updateUser = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'email', 'password'];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid updates provided' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();  // Use save to trigger password hashing

        res.json(user);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: messages });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.remove();  // Use remove() to trigger any pre-remove hooks
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};