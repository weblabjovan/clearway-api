const mongoose = require('mongoose');
const Route = require('../../models/Route');

class RouteController {
	constructor(user) {
		this.user = user;
		this.route = Route;
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

	makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber) {
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