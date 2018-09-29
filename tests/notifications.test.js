const mongoose = require('mongoose');
const keys = require('../keys/keys');
const NotificationController = require('../helpers/notifications/NotificationController');
const Notification = require('../models/Notification');

describe('routes', () => {
	const notificationController = new NotificationController();

	beforeAll(() => {
	  mongoose.connect(keys.mongoURI);
	});

	afterAll(async () => {
	  mongoose.disconnect();
	});

	it('instantiate notification controller', () => {
		expect(notificationController).toHaveProperty('notification');
	});

	it('creates new notification', async () => {
		const data = {user: keys.testUserId, reference: keys.testRatingId, referenceType: 'driver'};
		const newNotification = await notificationController.createNotification(data);


		expect(newNotification.user).toEqual(keys.testUserId);
		expect(newNotification.reference).toEqual(keys.testRatingId);
		expect(newNotification.referenceType).toEqual('driver');
		expect(newNotification.status).toEqual('active');
		expect(typeof newNotification.createDate).toEqual('string');
	});

	

})

