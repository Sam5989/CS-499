const mongoose = require('./db');
const Trip = require('./travlr');
const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, '../data/trips.json');

const seedDB = async () => {
    try {
        const trips = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

        await Trip.deleteMany({});
        await Trip.insertMany(trips);

        console.log(`Seeded ${trips.length} trips successfully.`);
    } catch (err) {
        console.error('Database seeding failed:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

seedDB();
