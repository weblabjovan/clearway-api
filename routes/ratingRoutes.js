const NotificationController = require('../helpers/notifications/NotificationController');
const RatingController = require('../helpers/ratings/RatingController');
const RideController = require('../helpers/rides/RideController');
const UserController = require('../helpers/users/UserController');
const passport = require('passport');
const passportConf = require('../helpers/passport');

module.exports = app => {
	
	app.get('/api/notification/myNotifications', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const notificationController = new NotificationController();
	
		try{
			const myNotifications = await notificationController.getMyActiveNotifications(req.user.id);
			res.status(200).send(myNotifications);
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	})	

	app.post('/api/rating/getThis', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const ratingController = new RatingController();
		const rideController = new RideController(req.user);
		const userController = new UserController();
		try{
			const rating = await ratingController.getRatingById(req.body.id);
			const ride = await rideController.getRideForRating(rating.reservation);
			const user = await userController.getUserById(rating.ratedUser);
			const result = {rating, ride, user, type: req.body.type};

			res.status(200).send(result);
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	})

	app.post('/api/rating/save', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const { rating, marks, user, notification } = req.body;
		const ratingController = new RatingController();
		const notificationController = new NotificationController();
		const userController = new UserController();
		const average = (parseInt(marks.time) + parseInt(marks.money) + parseInt(marks.comm)) / 3;
		
		try{
			await ratingController.updateRating({id:rating, time: marks.time, money: marks.money, comm: marks.comm});
			await notificationController.changeNotificationStatus(notification, 'done');
			await userController.updateUserRating({id: user, rating: average});
			res.status(200).send({});
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	})
}