const request = require('supertest');
const mongoose = require('mongoose');
const { app, Vehicle, Booking } = require('../server');

// Test database
const MONGODB_URI = 'mongodb://localhost:27017/fleetlink_test';

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('FleetLink API', () => {
    describe('POST /api/vehicles', () => {
        it('should create a new vehicle with valid data', async () => {
            const vehicleData = {
                name: 'Truck A',
                capacityKg: 1000,
                tyres: 6
            };

            const response = await request(app)
                .post('/api/vehicles')
                .send(vehicleData)
                .expect(201);

            expect(response.body).toMatchObject(vehicleData);
            expect(response.body._id).toBeDefined();
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/vehicles')
                .send({ name: 'Incomplete Vehicle' })
                .expect(400);

            expect(response.body.error).toContain('Missing required fields');
        });

        it('should return 400 for invalid capacity', async () => {
            const vehicleData = {
                name: 'Invalid Vehicle',
                capacityKg: -100,
                tyres: 4
            };

            const response = await request(app)
                .post('/api/vehicles')
                .send(vehicleData)
                .expect(400);

            expect(response.body.error).toContain('capacityKg must be a positive number');
        });
    });

    describe('GET /api/vehicles/available', () => {
        let vehicle1, vehicle2;

        beforeEach(async () => {
            vehicle1 = await Vehicle.create({
                name: 'Small Truck',
                capacityKg: 500,
                tyres: 4
            });

            vehicle2 = await Vehicle.create({
                name: 'Large Truck',
                capacityKg: 1500,
                tyres: 6
            });
        });

        it('should return available vehicles based on capacity', async () => {
            const response = await request(app)
                .get('/api/vehicles/available')
                .query({
                    capacityRequired: 600,
                    fromPincode: '400001',
                    toPincode: '400002',
                    startTime: '2023-12-01T10:00:00Z'
                })
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].name).toBe('Large Truck');
            expect(response.body[0].estimatedRideDurationHours).toBe(1);
        });

        it('should exclude vehicles with conflicting bookings', async () => {
            // Create a booking for vehicle2
            await Booking.create({
                vehicleId: vehicle2._id,
                customerId: 'customer1',
                fromPincode: '400001',
                toPincode: '400002',
                startTime: new Date('2023-12-01T09:00:00Z'),
                endTime: new Date('2023-12-01T12:00:00Z'),
                estimatedRideDurationHours: 3
            });

            const response = await request(app)
                .get('/api/vehicles/available')
                .query({
                    capacityRequired: 600,
                    fromPincode: '400001',
                    toPincode: '400002',
                    startTime: '2023-12-01T10:00:00Z'
                })
                .expect(200);

            expect(response.body).toHaveLength(0);
        });

        it('should return 400 for missing query parameters', async () => {
            const response = await request(app)
                .get('/api/vehicles/available')
                .query({
                    capacityRequired: 500
                })
                .expect(400);

            expect(response.body.error).toContain('Missing required query parameters');
        });
    });

    describe('POST /api/bookings', () => {
        let vehicle;

        beforeEach(async () => {
            vehicle = await Vehicle.create({
                name: 'Test Truck',
                capacityKg: 1000,
                tyres: 4
            });
        });

        it('should create a booking for available vehicle', async () => {
            const bookingData = {
                vehicleId: vehicle._id.toString(),
                fromPincode: '400001',
                toPincode: '400005',
                startTime: '2023-12-01T10:00:00Z',
                customerId: 'customer123'
            };

            const response = await request(app)
                .post('/api/bookings')
                .send(bookingData)
                .expect(201);

            expect(response.body.vehicleId._id).toBe(vehicle._id.toString());
            expect(response.body.customerId).toBe('customer123');
            expect(response.body.estimatedRideDurationHours).toBe(4);
        });

        it('should return 409 for conflicting bookings', async () => {
            // Create initial booking
            await Booking.create({
                vehicleId: vehicle._id,
                customerId: 'customer1',
                fromPincode: '400001',
                toPincode: '400002',
                startTime: new Date('2023-12-01T09:00:00Z'),
                endTime: new Date('2023-12-01T12:00:00Z'),
                estimatedRideDurationHours: 3
            });

            const conflictingBooking = {
                vehicleId: vehicle._id.toString(),
                fromPincode: '400001',
                toPincode: '400003',
                startTime: '2023-12-01T10:00:00Z',
                customerId: 'customer2'
            };

            const response = await request(app)
                .post('/api/bookings')
                .send(conflictingBooking)
                .expect(409);

            expect(response.body.error).toContain('already booked for an overlapping time slot');
        });

        it('should return 404 for non-existent vehicle', async () => {
            const invalidBooking = {
                vehicleId: new mongoose.Types.ObjectId().toString(),
                fromPincode: '400001',
                toPincode: '400002',
                startTime: '2023-12-01T10:00:00Z',
                customerId: 'customer123'
            };

            const response = await request(app)
                .post('/api/bookings')
                .send(invalidBooking)
                .expect(404);

            expect(response.body.error).toBe('Vehicle not found');
        });
    });
});
