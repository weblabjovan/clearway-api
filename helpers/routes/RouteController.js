const Route = require('../../models/Route');
const downsizeObject = require('../downsizeObject');
const userDecorater = require('../users/userDecorater');
const distanceMeter = require('./distanceMeter');
const moment = require('moment');


class RouteController {
	constructor(user) {
		this.user = user;
		this.route = Route;
	}

	getClosestSteps(route, position){
		if (route instanceof Route == false) {
			throw new Error('Internal server error: route object is not of correct type');
		}
		if (!Array.isArray(route.steps) || route.steps.length < 3) {
			throw new Error('Internal server error: route steps is not properly defined');
		}
		if (!position.startObj || !position.endObj || !position.distance) {
			throw new Error('Internal server error: position object does not have proper atributes');
		}
		if (typeof position.startObj.lat != 'number' || typeof position.startObj.lng != 'number' || typeof position.endObj.lat != 'number' || typeof position.endObj.lng != 'number') {
			throw new Error('Internal server error: start or end objects do not have proper values');
		}
		let start = null;
		let end = null;
		
		route.steps.map( (step, index) => {
			if (distanceMeter(step, position.startObj) < position.distance) {
				if (!start) {
					start = {step: index, distance: distanceMeter(step, position.startObj)}
				}else{
					if (distanceMeter(step, position.startObj) < start.distance) {
						start = {step: index, distance: distanceMeter(step, position.startObj)}
					}
				}
			}

			if (distanceMeter(step, position.endObj) < position.distance) {
				if (!end) {
					end = {step: index, distance: distanceMeter(step, position.endObj)}
				}else{
					if (distanceMeter(step, position.endObj) < end.distance) {
						end = {step: index, distance: distanceMeter(step, position.endObj)}
					}
				}
			}
		})

		return {start: start, end: end};
	}

	async prepareRouteForReservation(route, position) {
		if (route instanceof Route == false) {
			throw new Error('Internal server error: route object is not of correct type');
		}
		const steps = this.getClosestSteps(route, position);
		const rideTime = Math.ceil((steps.end.step - steps.start.step)/3);
		const rideStart = moment(moment(route.time,'HH:mm').add(Math.ceil(steps.start.step/3), 'minutes')).format('HH:mm');
		const rideDiscount = 100 - Math.ceil(((steps.end.step-steps.start.step)/route.steps.length)*100);
		const wantedFields = ['userObj', 'time', 'price', 'spots', 'end', 'start', '_id', 'rideTime', 'rideStart', 'rideDiscount', 'startDistance', 'rideDate'];

		let newRoute = await userDecorater(route);

		newRoute.rideTime = rideTime;
		newRoute.rideStart = rideStart;
		newRoute.rideDiscount = rideDiscount;
		newRoute.startDistance = steps.start.distance;
		newRoute.rideDate = position.date;
		newRoute = downsizeObject(newRoute, wantedFields);
		
		return newRoute;
	}

	searchRoutes(routes, startObj, endObj, distance) {
		if (!Array.isArray(routes)) {
			throw new Error('Internal server error: routes is not an array');
		}
		if (Object.keys(startObj).sort() == ['lat', 'lng']) {
			throw new Error('Internal server error: startObj keys are properly defined');
		}
		if (typeof startObj.lat != 'number' || typeof startObj.lng != 'number') {
			throw new Error('Internal server error: startObj values are properly defined');
		}
		if (Object.keys(endObj).sort() == ['lat', 'lng']) {
			throw new Error('Internal server error: endObj keys are properly defined');
		}
		if (typeof endObj.lat != 'number' || typeof endObj.lng != 'number') {
			throw new Error('Internal server error: endObj values are properly defined');
		}

		return routes.filter( route => {
			if (route instanceof Route == false) {
				throw new Error('Internal server error: route object is not of correct type');
			}
			let start = false;
			let end = false;
			
			route.steps.map( (step, index) => {
				if (distanceMeter(step, startObj) < distance) {
					start = index;
				}
				if (distanceMeter(step, endObj) < distance) {
					end = index;
				}
			});

			if (typeof start === 'number' && typeof end === 'number') {
				if (start < end) {
					return route;
				}
			};
		});
	}

	async decorateSearchObjects(searchArr) {
		if (!Array.isArray(searchArr)) {
			throw new Error('Internal server error: searchArr is not an array');
		}

		const res = searchArr.map( async obj => {
			if (obj instanceof Route == false) {
				throw new Error('Internal server error: search object is not of correct type');
			}
			const wantedFields = ['userObj', 'time', 'price', 'spots', 'end', 'start', '_id'];

			const x = await userDecorater(obj);
			const y = downsizeObject(x, wantedFields);
			
			return y;
		});

		return Promise.all(res);
	}

	async getAllMyRoutes() {
		const routes = await this.route.find({
			status: 'active',
			user: this.user.id
		});

		return routes;
	}

	async deleteRoute(routeId) {
		await this.route.findOneAndUpdate(
			{_id: routeId},
			{ status: 'deleted' }
		);
	}

	async activateRoute(routeId) {
		await this.route.findOneAndUpdate(
			{_id: routeId},
			{ status: 'active' }
		);
	}

	async getRouteById(routeId) {
		const route = await this.route.findOne({_id: routeId});
		return route;
	}

	makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber) {
		if (typeof routeInfo.user != 'string' || typeof routeInfo.start != 'string' || typeof routeInfo.end != 'string' || typeof routeInfo.spots != 'number' || typeof routeInfo.price != 'number' || typeof routeInfo.frequency != 'number') {
			throw new Error('Internal server error: routeInfo types not properly defined');
		}

		if (!routeInfo.user.trim()  || !routeInfo.start.trim() || !routeInfo.end.trim() || routeInfo.spots == 0 || routeInfo.price == 0 || routeInfo.frequency == 0) {
			throw new Error('Internal server error: routeInfo values not properly defined');
		}


		if (!Array.isArray(waypoints)) {
			throw new Error('Internal server error: waypoints not properly defined');
		}

		if (!Array.isArray(steps) || steps.length < 3) {
			throw new Error('Internal server error: steps not properly defined');
		}
		const dataObj = routeInfo;
		dataObj.waypoints = waypoints;
		dataObj.steps = steps;
		dataObj.time = time;
		dataObj.timeNumber = timeNumber;
		dataObj.date = date;
		dataObj.dateNumber = dateNumber;

		if (dataObj.frequency != 2) {
			dataObj.date = null;
			dataObj.dateNumber = 0;
		};

		return dataObj;
	}

	async createRoute(data) {
		const route = new Route({
			user: this.user.id,
			start: data.start,
			end: data.end,
			time: data.time,
			timeNumber: data.timeNumber,
			frequency: data.frequency,
			date: data.date,
			dateNumber: data.dateNumber,
			spots: data.spots,
			price: data.rate,
			waypoints: data.waypoints,
			steps: data.steps,
			status: 'active',
			activatedAt: Date.now()
		});

		return route;
	}
}

module.exports = RouteController;