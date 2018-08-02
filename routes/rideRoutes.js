const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Route = require('../models/Route');
const passport = require('passport');
const passportConf = require('../helpers/passport');
const jsonWebToken = require('../helpers/jsonWebToken');
const nodeDate = require('../helpers/nodeDate');
const RideController = require('../helpers/rides/RideController');
const RideTimeController = require('../helpers/rides/RideTimeController');

module.exports = app => {
	
	app.post('/api/ride/save', passport.authenticate('jwt', { session: false }), async (req, res) => {	
		const MyRide = new RideController(req.user);
		const MyRideTime = new RideTimeController(req.user);

		const route = await Route.findById(req.body.route , function(err, route) {
			if (err) return res.status(400).send(err);
			return route;
		});

		const rideInDateBase = await MyRideTime.getRouteRideOnDate(req.body.route, req.body.searchParams.date);

		if (rideInDateBase != null) {
			if (rideInDateBase.reservations.length < rideInDateBase.route.spots) {
				const istimeOverlap = await MyRideTime.isRideOverLapping(req.body.searchParams.date, route.time);
				if (!istimeOverlap) {
					try{
						const newRes = {
							user: req.user._id,  
							start: req.body.searchParams.start,
							startPoint: req.body.searchParams.startObj,
							end: req.body.searchParams.end,
							endPoint: req.body.searchParams.endObj,
							status: 'sent',
							statusChange: true
						};
						rideInDateBase.reservations.push(newRes);
						await rideInDateBase.save();
						res.status(200).send('Updejtovana vožnja.');
					}catch(error){
						console.log(error);
						res.status(422).send(error);
					}
				}
			}
		}else{

			const istimeOverlap = await MyRideTime.isRideOverLapping(req.body.searchParams.date, route.time);

			if (!istimeOverlap) {
				const dateOp = Object.create(nodeDate);
				const ride = await MyRide.createRide(route, req.body.searchParams, dateOp.calculateDateNumber(req.body.searchParams.date));
				try{
					await ride.save();
					res.status(200).send('Kreirana vožnja.');
				}catch(error){
					console.log(error);
					res.status(422).send(error);
				}
			}else{
				res.status(500).json({error: 'Došlo je do preklapanja vožnji.' });
			}
		}
	});
	
	app.get('/api/ride/myRides', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const MyRide = new RideController(req.user);
	
		try{
			const myPassangerRides = await MyRide.getMyPassangerRides();
			const myDriverRides = await MyRide.getMyDriverRides();
			const myRides = {passanger: myPassangerRides, driver: myDriverRides};
			res.status(200).send(myRides);
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
		
	});

	app.post('/api/ride/reservationStatusChange', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const MyRide = new RideController(req.user);

		try{
			await MyRide.changeReservationStatus(req.body.id, req.body.status);
			const myPassangerRides = await MyRide.getMyPassangerRides();
			const myDriverRides = await MyRide.getMyDriverRides();
			const myRides = {passanger: myPassangerRides, driver: myDriverRides};
			res.status(200).send(myRides);
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	})
}