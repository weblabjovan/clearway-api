const mongoose = require('mongoose');
const Route = require('../models/Route');
const passport = require('passport');
const passportConf = require('../helpers/passport');
const jsonWebToken = require('../helpers/jsonWebToken');
const nodeDate = require('../helpers/nodeDate');
const RouteController = require('../helpers/routes/RouteController');
const RouteTimeController = require('../helpers/routes/RouteTimeController');

const stepsDecorator = require('../helpers/routes/stepsDecorator');
const searchRoutes = require('../helpers/routes/searchRoutes');
const routeFreq = require('../helpers/routes/routeFrequencySearcher');
const decorateSearchObjects = require('../helpers/routes/decorateSearchObjects');
const prepareRouteForReservation = require('../helpers/routes/prepareRouteForReservation');

module.exports = app => {
	app.post('/api/route/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const MyRoute = new RouteController(req.user);
		try{
			await MyRoute.deleteRoute(req.body.routeId);
			const routes = await MyRoute.getAllMyRoutes();
			res.status(200).send(routes);
		}catch(error){
			console.log(error)
			res.status(500).send(error);
		}
	})

	app.post('/api/route/save', passport.authenticate('jwt', { session: false }), async (req, res) => {
			const nDate = Object.create(nodeDate);
			nDate.init(req.body.routeInfo.time);
			const MyRoute = new RouteController(req.user);
			const MyTimeRoute = new RouteTimeController(req.user);
			const overlap = await MyTimeRoute.areMyRoutesOverlaping(nDate.getOnlyTime(), req.body.routeInfo.frequency, req.body.routeInfo.date);
				if (!overlap) {
					const waypoints = req.body.waypoints.map( val => {
						return {lat: val.location.lat, lng: val.location.lng};
					})
					let steps = req.body.steps.map( val => {
						return {lat: val.start.lat, lng: val.start.lng};
					});
					steps = stepsDecorator(steps);
					const myDate = req.body.routeInfo.date || null;
					const routeData = MyRoute.makeCreateDataObj(
						req.body.routeInfo, 
						waypoints, 
						steps, 
						nDate.getOnlyTime(),
						nDate.calculateTimeNumber(nDate.getOnlyTime()),
						myDate,
						nDate.calculateDateNumber(myDate)
					);
					const route = await MyRoute.createRoute(routeData);

					try{
						await route.save();
						res.status(200).send('Route created');
					}catch(error){
						res.status(422).send(error);
					}
				}else{
					res.status(500).json({error: 'Došlo je do preklapanja vožnji.'});
				}
	});
	app.get('/api/route/myRoutes', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const MyRoute = new RouteController(req.user);
		try{
			const routes = await MyRoute.getAllMyRoutes();
			res.status(200).send(routes);
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	});

	app.post('/api/route/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
		const wantedFreqencies = routeFreq(req.body.dateString);
		const routes = await Route.find({$and: [
				{status: {$eq: "active"}}, 
				{frequency: {$in: wantedFreqencies}}
			]
		});
		let result = searchRoutes(routes, req.body.startObj, req.body.endObj, req.body.distance);
		try{
			result = await decorateSearchObjects(result);
			res.status(200).send(result);
		}catch(error){
			res.status(422).send(error);
		}
	})

	app.post('/api/route/getRouteForApplication', passport.authenticate('jwt', { session: false }), async (req, res) => {
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