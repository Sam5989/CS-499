const mongoose = require('mongoose');

// Define the trip schema with database-level constraints and indexes.
const tripSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    length: {
        type: String,
        required: true,
        trim: true
    },
    start: {
        type: Date,
        required: true
    },
    resort: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    perPerson: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }
});

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;
