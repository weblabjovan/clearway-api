const mongoose = require('mongoose');
const Route = require('../../models/Route');
const nodeDate = require('../nodeDate');

class RouteTimeController {
	constructor(user) {
		this.user = user;
		this.route = Route;
		this.dateOp = Object.create(nodeDate);
	}

	isRouteOverlap(routeObj, timeNumber, frequency, date) {
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
					forbiden.push(routeObj.frequency);
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