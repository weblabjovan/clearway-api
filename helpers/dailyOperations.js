const cron = require('cron');
const RideTimeController = require('./rides/RideTimeController');
const RatingController = require('./ratings/RatingController');
const NotificationController = require('./notifications/NotificationController');

module.exports = new cron.CronJob({
	  cronTime: '*/2 * * * *',
	  onTick: async function() {
	    const timeController = new RideTimeController({});
	    const ratingController = new RatingController();
	    const notificationController = new NotificationController();

	    const reservations = await timeController.getReservationsForRate();
	    if (reservations.length > 0) {
	    	const newRatings = await ratingController.createDailyRatings(reservations);
		    await notificationController.createDailyNotifications(newRatings);
		    await timeController.deactivateRides();
	    }

	  },
	  start: false,
	  timeZone: 'Europe/Belgrade'
	});