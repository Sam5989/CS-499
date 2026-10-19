const User = require('../models/users');
const passport = require('passport');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase()
        });

        user.setPassword(password);
        await user.save();

        const token = user.generateJWT();
        return res.status(201).json({ token });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An account with that email already exists.' });
        }

        return res.status(500).json({ message: 'Unable to create account.' });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Authentication service error.' });
        }

        if (!user) {
            return res.status(401).json({
                message: info?.message || 'Invalid email or password.'
            });
        }

        try {
            const token = user.generateJWT();
            return res.status(200).json({ token });
        } catch (tokenError) {
            return res.status(500).json({ message: 'Unable to create authentication token.' });
        }
    })(req, res);
};

module.exports = {
    register,
    login
};
