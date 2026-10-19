const Trip = require('../models/travlr');
const Model = Trip;

// Escape regular-expression characters before using user input in a MongoDB regex.
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Validate and normalize trip data before sending it to MongoDB.
const getValidatedTripData = body => {
    const requiredFields = [
        'code', 'name', 'length', 'start',
        'resort', 'perPerson', 'image', 'description'
    ];

    if (!body || typeof body !== 'object') {
        return { error: 'Trip data is required.' };
    }

    const missingField = requiredFields.find(
        field => body[field] === undefined || body[field] === null || String(body[field]).trim() === ''
    );

    if (missingField) {
        return { error: `The ${missingField} field is required.` };
    }

    const startDate = new Date(body.start);
    if (Number.isNaN(startDate.getTime())) {
        return { error: 'The start field must contain a valid date.' };
    }

    return {
        data: {
            code: String(body.code).trim(),
            name: String(body.name).trim(),
            length: String(body.length).trim(),
            start: startDate,
            resort: String(body.resort).trim(),
            perPerson: String(body.perPerson).trim(),
            image: String(body.image).trim(),
            description: String(body.description).trim()
        }
    };
};

// Get a page of trips, with optional name/resort filtering.
const tripsList = async (req, res) => {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;
    const rawSearch = typeof req.query.search === 'string'
        ? req.query.search.trim()
        : '';
    const search = escapeRegex(rawSearch);

    const filter = search
        ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { resort: { $regex: search, $options: 'i' } }
            ]
        }
        : {};

    try {
        const skip = (page - 1) * limit;
        const [trips, total] = await Promise.all([
            Model.find(filter)
                .select('code name length start resort perPerson image description')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .maxTimeMS(5000)
                .exec(),
            Model.countDocuments(filter).maxTimeMS(5000).exec()
        ]);

        return res.status(200).json({
            trips,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to retrieve trips from the database.' });
    }
};

// Get a trip by its code.
const tripsFindByCode = async (req, res) => {
    const tripCode = typeof req.params.tripCode === 'string'
        ? req.params.tripCode.trim()
        : '';

    if (!tripCode) {
        return res.status(400).json({ message: 'Trip code is required.' });
    }

    try {
        const trip = await Model.findOne({ code: tripCode })
            .select('code name length start resort perPerson image description')
            .lean()
            .maxTimeMS(5000)
            .exec();

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        return res.status(200).json(trip);
    } catch (err) {
        return res.status(500).json({ message: 'Unable to retrieve trip from the database.' });
    }
};

// Add a new trip.
const tripsAddTrip = async (req, res) => {
    const validation = getValidatedTripData(req.body);

    if (validation.error) {
        return res.status(400).json({ message: validation.error });
    }

    try {
        const newTrip = new Trip(validation.data);
        const savedTrip = await newTrip.save();
        return res.status(201).json(savedTrip);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: 'Trip data failed database validation.' });
        }

        if (err.code === 11000) {
            return res.status(409).json({ message: 'A trip with that code already exists.' });
        }

        return res.status(500).json({ message: 'Unable to create trip in the database.' });
    }
};

// Update an existing trip.
const tripsUpdateTrip = async (req, res) => {
    const tripCode = typeof req.params.tripCode === 'string'
        ? req.params.tripCode.trim()
        : '';
    const validation = getValidatedTripData(req.body);

    if (!tripCode) {
        return res.status(400).json({ message: 'Trip code is required.' });
    }

    if (validation.error) {
        return res.status(400).json({ message: validation.error });
    }

    try {
        const updatedTrip = await Model.findOneAndUpdate(
            { code: tripCode },
            { $set: validation.data },
            { new: true, runValidators: true, context: 'query' }
        )
            .select('code name length start resort perPerson image description')
            .lean()
            .maxTimeMS(5000)
            .exec();

        if (!updatedTrip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        return res.status(200).json(updatedTrip);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: 'Trip data failed database validation.' });
        }

        if (err.code === 11000) {
            return res.status(409).json({ message: 'A trip with that code already exists.' });
        }

        return res.status(500).json({ message: 'Unable to update trip in the database.' });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};
