const mongoose = require('mongoose');
const keys = require('../keys/keys');
const RideController = require('../helpers/rides/RideController');
const RideTimeController = require('../helpers/rides/RideTimeController');
const Ride = require('../models/Ride');

describe('rides', () => {

	const rideController = new RideController({id: keys.testUserId});
	const rideTimeController = new RideTimeController({id: keys.testUserId});

	beforeAll(() => {
	  mongoose.connect(keys.mongoURI);
	});

	afterAll(async () => {
		await rideController.setBackReservationStatus(keys.testReservationId);
	  	mongoose.disconnect();
	});

	
	it('instantiate ride controller', () => {
		expect(rideController).toHaveProperty('user.id');
		expect(rideController).toHaveProperty('ride.base.models');
	});

	it('instantiate ride time controller', () => {
		expect(rideTimeController).toHaveProperty('user.id');
		expect(rideTimeController).toHaveProperty('ride.base.models');
		expect(rideTimeController).toHaveProperty('dateOp');
	});

	it('changes the reservation status', async () => {
		const reservationId = keys.testReservationId;
		const status = 'test';
		const reservationBeforeChange = await rideController.getRideById(keys.testRideId);
		await rideController.changeReservationStatus(reservationId, status);
		const reservationAfterChange = await rideController.getRideById(keys.testRideId);
		
		expect(reservationId).toBeDefined();
		expect(status).toBeDefined();
		expect(typeof reservationId).toEqual('string');
		expect(typeof status).toEqual('string');
		expect(reservationId.trim()).not.toBe('');
		expect(status.trim()).not.toBe('');
		expect(reservationBeforeChange.reservations[0].status).toEqual('sent');
		expect(reservationAfterChange.reservations[0].status).toEqual('test');

	});

	it('prepares passenger rides', async () => {
		const ride = await rideController.getRideById(keys.testRideId);
		const newRides = await rideController.preparePassangerRides([ride]);
		
		expect(ride instanceof Ride).toBe(true);
		expect(newRides.length).toBe(1);
		expect(newRides[0].reservations.length).toBe(0);
		expect(Array.isArray(newRides)).toBe(true);
		newRides.map( ride => {
			expect(ride instanceof Ride).toBe(true);
		})

	});

	it('prepares driver rides', async () => {
		const ride = await rideController.getRideById(keys.testRideId);
		const newRides = await rideController.prepareDriverRides([ride]);
		
		expect(ride instanceof Ride).toBe(true);
		expect(newRides.length).toBe(1);
		expect(newRides[0].reservations.length).toBe(1);
		expect(Array.isArray(newRides)).toBe(true);
		newRides.map( ride => {
			expect(ride instanceof Ride).toBe(true);
		})
	});

	it('gets rides that need to be rated', async () => {
		const rides = await rideController.getRideForRating(keys.testReservationId);
		
		expect(typeof keys.testReservationId).toEqual('string');
		expect(Array.isArray(rides)).toBe(false);
		expect(rides.reservation).toBeDefined();
		expect(rides.reservation._id.toJSON()).toEqual(keys.testReservationId);
		expect(rides.time).toBeDefined();
		expect(typeof rides.time).toEqual('string');
		expect(rides.date).toBeDefined();
		expect(typeof rides.date).toEqual('number');
	});

	it('gets my rides on defined date', async () => {
		const date = 'Mon Aug 13 2018 21:52:13 GMT+0200';
		const rides = await rideTimeController.getMyRidesOnDate(date);
		
		expect(typeof date).toEqual('string');
		expect(Array.isArray(rides)).toBe(true);
		rides.map(ride => {
			expect(ride instanceof Ride).toBe(true);
			expect(ride.status).toEqual('active');
		});
	});

	it('gets rides that needs to be rated', async () => {
		const rides = await rideTimeController.getReservationsForRate();

		expect(Array.isArray(rides)).toBe(true);
		rides.map(ride => {
			expect(ride instanceof Ride).toBe(true);
			expect(ride.reservations).toBeDefined();
			expect(ride.route.user).toBeDefined();
			expect(ride.route._id).toBeDefined();
		});
	});

	it('checks if the ride is overlaping with existing ones', async () => {
		const date = 'Mon Aug 13 2018 21:52:13 GMT+0200';
		const time = '09:00';
		const flag = await rideTimeController.isRideOverLapping(date, time);

		expect(typeof date).toEqual('string');
		expect(typeof time).toEqual('string');
		expect(date.trim().length > 0).toBe(true);
		expect(time.trim().length > 0).toBe(true);
		expect(flag).toBe(false);
	});

	it('gets ride on defined route on the date', async () => {
		const date = 'Mon Aug 13 2018 21:52:13 GMT+0200';
		const route = keys.testRouteId;
		const rides = await rideTimeController.getRouteRideOnDate(route, date);

		expect(typeof date).toEqual('string');
		expect(typeof route).toEqual('string');
		expect(date.trim().length > 0).toBe(true);
		expect(route.trim().length > 0).toBe(true);
		expect(rides).toBe(null);
	});
})