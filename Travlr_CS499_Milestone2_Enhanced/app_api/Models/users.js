const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    hash: String,
    salt: String
});

// Set a salted password hash for the user.
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        'sha512'
    ).toString('hex');
};

// Compare an entered password with the stored hash.
userSchema.methods.validPassword = function(password) {
    const hash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        'sha512'
    ).toString('hex');

    return this.hash === hash;
};

// Generate a JSON Web Token for the current user.
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = mongoose.model('users', userSchema);
