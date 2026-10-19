const Trip = require('../models/travlr');
const Model = Trip;

// Get all trips.
const tripsList = async (req, res) => {
    try {
        const trips = await Model.find({}).exec();
        return res.status(200).json(trips);
    } catch (err) {
        return res.status(500).json({ message: 'Unable to retrieve trips.' });
    }
};

// Get a trip by its code.
const tripsFindByCode = async (req, res) => {
    try {
        const trip = await Model.findOne({ code: req.params.tripCode }).exec();

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        return res.status(200).json(trip);
    } catch (err) {
        return res.status(500).json({ message: 'Unable to retrieve trip.' });
    }
};

// Add a new trip.
const tripsAddTrip = async (req, res) => {
    const requiredFields = [
        'code', 'name', 'length', 'start',
        'resort', 'perPerson', 'image', 'description'
    ];

    const missingField = requiredFields.find(
        field => req.body[field] === undefined || req.body[field] === ''
    );

    if (missingField) {
        return res.status(400).json({
            message: `The ${missingField} field is required.`
        });
    }

    try {
        const newTrip = new Trip({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description
        });

        const savedTrip = await newTrip.save();
        return res.status(201).json(savedTrip);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Trip data failed validation.' });
        }

        if (err.code === 11000) {
            return res.status(409).json({ message: 'A trip with that code already exists.' });
        }

        return res.status(500).json({ message: 'Unable to create trip.' });
    }
};

// Update an existing trip.
const tripsUpdateTrip = async (req, res) => {
    try {
        const updatedTrip = await Model.findOneAndUpdate(
            { code: req.params.tripCode },
            {
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description
            },
            { new: true, runValidators: true }
        ).exec();

        if (!updatedTrip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        return res.status(200).json(updatedTrip);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Trip data failed validation.' });
        }

        return res.status(500).json({ message: 'Unable to update trip.' });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};
