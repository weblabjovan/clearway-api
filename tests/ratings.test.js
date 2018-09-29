const mongoose = require('mongoose');
const keys = require('../keys/keys');
const RatingController = require('../helpers/ratings/RatingController');
const Rating = require('../models/Rating');

describe('routes', () => {
	const ratingController = new RatingController();

	beforeAll(() => {
	  mongoose.connect(keys.mongoURI);
	});

	afterAll(async () => {
	  mongoose.disconnect();
	});

	it('instantiate rating controller', () => {
		expect(ratingController).toHaveProperty('rating');
	});

	it('checks if the reservation can be made', async () => {
		const user = keys.testUserId;
		const user1 = keys.testUserId_1;

		expect(typeof user).toBe('string');
		expect(typeof user1).toBe('string');
		expect(await ratingController.isForNewReservation(user)).toBe(false);
		expect(await ratingController.isForNewReservation(user1)).toBe(true);
	});

	it('creates new rating object', async () => {
		const data = { user: keys.testUserId, ratedUser: keys.testUserId_1, route: keys.testRouteId, reservation: keys.testReservationId};
		const newRating = await ratingController.createRating(data);

		expect(typeof data.user).toBe('string');
		expect(typeof data.ratedUser).toBe('string');
		expect(typeof data.route).toBe('string');
		expect(typeof data.reservation).toBe('string');
		expect(newRating instanceof Rating).toBe(true);
		expect(newRating.user).toEqual(data.user);
		expect(newRating.ratedUser).toEqual(data.ratedUser);
		expect(newRating.timeRate).toEqual(0);
		expect(newRating.moneyRate).toEqual(0);
		expect(newRating.commRate).toEqual(0);
		expect(newRating.averageRate).toEqual(0);
		expect(newRating.route).toEqual(data.route);
		expect(newRating.reservation).toEqual(data.reservation);

	});

	it('gets the rating by its id', async () => {
		const rating = await ratingController.getRatingById(keys.testRatingId);
	
		expect(typeof keys.testRatingId).toBe('string');
		expect(rating.timeRate).toEqual(5);
		expect(rating.moneyRate).toEqual(4);
		expect(rating.commRate).toEqual(5);
		expect(rating.user).toEqual('5b295f9efa1fea02e0019372');
		expect(rating.createDate).toEqual('1533748680789');
	});

	it('creates daily ratings', async () => {
		const list = [1,2,3];

		expect(Array.isArray(list)).toBe(true);
	});

})

