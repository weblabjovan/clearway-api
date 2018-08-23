const mongoose = require('mongoose');
const Route = require('../../models/Route');
const nodeDate = require('../nodeDate');

class RouteTimeController {
	constructor(user) {
		this.user = user;
		this.route = Route;
		this.dateOp = Object.create(nodeDate);
	}

	frequncyMatcher(date) {
		if (!date || new Date(date).toISOString() != date) {
			throw new Error('Internal Server Error: date not properly defined');
		}

		let freq = [3];
		this.dateOp.init(date);

		if (this.dateOp.isWeekend()) {
			freq.push(5);
		}else{
			freq.push(4);
		}

		if (this.dateOp.isToday()) {
			freq.push(1);
		}else{
			freq.push(2);
		}

		return freq;
	}

	isRouteOverlap(routeObj, timeNumber, frequency, date) {
		if (routeObj instanceof Route == false) {
			throw new Error('Internal server error: route object is not of correct type');
		}
		if (typeof timeNumber != 'number' || typeof frequency != 'number') {
			throw new Error('Internal server error: timeNumber or frequency are not of correct type');
		}

		this.dateOp.init(new Date());
		if (!this.dateOp.isTimeDifferenceBiggerThanOneHour(routeObj.timeNumber, timeNumber)) {
			let forbiden = [3];
			if (frequency == 2) {
				if (routeObj.frequency == 2) {
					if (date === routeObj.date) {
						return true;
					}
				}else{
					this.dateOp.init(date);
					if (this.dateOp.isWeekend()) {
						if (routeObj.frequency == 5) {
							return true;
						}
					}else{
						if (routeObj.frequency == 4) {
							return true;
						}
					}
				}
			}else{
				if (routeObj.frequency  == 2) {
					this.dateOp.init(routeObj.date);
					if (this.dateOp.isWeekend()) {
						forbiden.push(5);
					}else{
						forbiden.push(4);
					}
				}else{
					if (routeObj.frequency != 1) {
						forbiden.push(routeObj.frequency);
					}
					
				}
			}
			
			for (var i = 0; i < forbiden.length; i++) {
				if (frequency == forbiden[i]) {
					return true;
				}
			}
		}

		return false;
	}

	async areMyRoutesOverlaping(time, frequency, date) {
		if (frequency == 2 && isNaN(Date.parse(date))) {
			throw new Error('Internal Server Error: params not properly defined');
		}
		const routes = await this.route.find({$and: [
				{status: {$eq: "active"}}, 
				{user: {$eq: this.user.id }}
			]
		});

		for (var i = 0; i < routes.length; i++) {
			if (this.isRouteOverlap(routes[i], this.dateOp.calculateTimeNumber(time), frequency, date)) {
				return true;
			}
		}

		return false;
	}
}

module.exports = RouteTimeController;