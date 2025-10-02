const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetlink', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    capacityKg: {
        type: Number,
        required: true,
        min: 1
    },
    tyres: {
        type: Number,
        required: true,
        min: 2
    }
}, {
    timestamps: true
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    customerId: {
        type: String,
        required: true,
        trim: true
    },
    fromPincode: {
        type: String,
        required: true,
        trim: true
    },
    toPincode: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    estimatedRideDurationHours: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Utility function to calculate ride duration
const calculateRideDuration = (fromPincode, toPincode) => {
    // Simplified logic as per requirement
    const from = parseInt(fromPincode) || 0;
    const to = parseInt(toPincode) || 0;
    return Math.abs(from - to) % 24;
};

// Utility function to check booking overlap
const hasBookingOverlap = (existingStart, existingEnd, newStart, newEnd) => {
    return (newStart < existingEnd) && (newEnd > existingStart);
};

// Routes

// POST /api/vehicles - Add a new vehicle
app.post('/api/vehicles', async (req, res) => {
    try {
        const { name, capacityKg, tyres } = req.body;

        // Validation
        if (!name || !capacityKg || !tyres) {
            return res.status(400).json({
                error: 'Missing required fields: name, capacityKg, and tyres are required'
            });
        }

        if (typeof capacityKg !== 'number' || capacityKg <= 0) {
            return res.status(400).json({
                error: 'capacityKg must be a positive number'
            });
        }

        if (typeof tyres !== 'number' || tyres < 2) {
            return res.status(400).json({
                error: 'tyres must be a number greater than or equal to 2'
            });
        }

        const vehicle = new Vehicle({
            name: name.trim(),
            capacityKg,
            tyres
        });

        const savedVehicle = await vehicle.save();
        res.status(201).json(savedVehicle);
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/vehicles/available - Find available vehicles
app.get('/api/vehicles/available', async (req, res) => {
    try {
        const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

        // Validation
        if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
            return res.status(400).json({
                error: 'Missing required query parameters: capacityRequired, fromPincode, toPincode, startTime'
            });
        }

        const capacity = parseFloat(capacityRequired);
        if (isNaN(capacity) || capacity <= 0) {
            return res.status(400).json({
                error: 'capacityRequired must be a positive number'
            });
        }

        const requestedStartTime = new Date(startTime);
        if (isNaN(requestedStartTime.getTime())) {
            return res.status(400).json({
                error: 'startTime must be a valid ISO date string'
            });
        }

        // Calculate estimated ride duration
        const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
        const requestedEndTime = new Date(requestedStartTime.getTime() + (estimatedRideDurationHours * 60 * 60 * 1000));

        // Find vehicles with sufficient capacity
        const suitableVehicles = await Vehicle.find({
            capacityKg: { $gte: capacity }
        });

        // Check availability for each vehicle
        const availableVehicles = [];
        
        for (const vehicle of suitableVehicles) {
            // Find existing bookings for this vehicle
            const conflictingBookings = await Booking.find({
                vehicleId: vehicle._id,
                $or: [
                    {
                        $and: [
                            { startTime: { $lt: requestedEndTime } },
                            { endTime: { $gt: requestedStartTime } }
                        ]
                    }
                ]
            });

            // If no conflicting bookings, vehicle is available
            if (conflictingBookings.length === 0) {
                availableVehicles.push({
                    ...vehicle.toObject(),
                    estimatedRideDurationHours
                });
            }
        }

        res.json(availableVehicles);
    } catch (error) {
        console.error('Error finding available vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/bookings - Book a vehicle
app.post('/api/bookings', async (req, res) => {
    try {
        const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;

        // Validation
        if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
            return res.status(400).json({
                error: 'Missing required fields: vehicleId, fromPincode, toPincode, startTime, customerId'
            });
        }

        // Verify vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const bookingStartTime = new Date(startTime);
        if (isNaN(bookingStartTime.getTime())) {
            return res.status(400).json({
                error: 'startTime must be a valid ISO date string'
            });
        }

        // Calculate booking end time
        const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
        const bookingEndTime = new Date(bookingStartTime.getTime() + (estimatedRideDurationHours * 60 * 60 * 1000));

        // Check for conflicting bookings (prevent race conditions)
        const conflictingBookings = await Booking.find({
            vehicleId: vehicleId,
            $or: [
                {
                    $and: [
                        { startTime: { $lt: bookingEndTime } },
                        { endTime: { $gt: bookingStartTime } }
                    ]
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.status(409).json({
                error: 'Vehicle is already booked for an overlapping time slot'
            });
        }

        // Create booking
        const booking = new Booking({
            vehicleId,
            customerId: customerId.trim(),
            fromPincode: fromPincode.trim(),
            toPincode: toPincode.trim(),
            startTime: bookingStartTime,
            endTime: bookingEndTime,
            estimatedRideDurationHours
        });

        const savedBooking = await booking.save();
        const populatedBooking = await Booking.findById(savedBooking._id).populate('vehicleId');
        
        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/vehicles - Get all vehicles (for testing)
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/bookings - Get all bookings (for testing)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('vehicleId');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'FleetLink API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

if (require.main === module) {
    startServer();
}

module.exports = { app, Vehicle, Booking, calculateRideDuration };

