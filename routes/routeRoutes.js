const mongoose = require('mongoose');
const Route = require('../models/Route');
const passport = require('passport');
const passportConf = require('../helpers/passport');
const jsonWebToken = require('../helpers/jsonWebToken');
const stepsDecorator = require('../helpers/routes/stepsDecorator');
const searchRoutes = require('../helpers/routes/searchRoutes');
const nodeDate = require('../helpers/nodeDate');
const routeFreq = require('../helpers/routes/routeFrequencySearcher');
const decorateSearchObjects = require('../helpers/routes/decorateSearchObjects');
const prepareRouteForReservation = require('../helpers/routes/prepareRouteForReservation');

module.exports = app => {
	app.post('/api/saveRoute', passport.authenticate('jwt', { session: false }), async (req, res) => {
		if (req.user) {
			let date = Object.create(nodeDate);
			const waypoints = req.body.waypoints.map( val => {
				return {lat: val.location.lat, lng: val.location.lng};
			})
			let steps = req.body.steps.map( val => {
				return {lat: val.start.lat, lng: val.start.lng};
			});
			steps = stepsDecorator(steps);

			const newRoute = new Route({
				user: req.user.id,
				start: req.body.routeInfo.start,
				end: req.body.routeInfo.end,
				time: req.body.routeInfo.time,
				frequency: req.body.routeInfo.frequency,
				spots: req.body.routeInfo.spots,
				price: req.body.routeInfo.rate,
				waypoints: waypoints,
				steps: steps,
				status: 'active',
				activatedAt: date.getActivatedAt()
			})

			try{
				await newRoute.save();
				res.status(200).send('Route created');
			}catch(error){
				res.status(422).send(error);
			}
		}else{
			res.status(400).json({error: 'User is not logged'});
		}
	})

	app.post('/api/searchRoutes', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const wantedFreqencies = routeFreq(req.body.date);
		const routes = await Route.find({$and: [
				{status: {$eq: "active"}}, 
				{frequency: {$in: wantedFreqencies}}
			]
		});

		let result = searchRoutes(routes, req.body.startObj, req.body.endObj);
		try{
			result = await decorateSearchObjects(result);
			res.status(200).send(result);
		}catch(error){
			res.status(422).send(error);
		}
	})

	app.post('/api/getRouteForApplication', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const route = await Route.findById(req.body.routeId , function(err, route) {
			if (err) return res.status(400).send(err);
			return route;
		});
		
		try{
			const result = await prepareRouteForReservation(route, req.body.params);
			res.status(200).send(result);
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	})
}