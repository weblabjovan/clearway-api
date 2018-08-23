const Ride = require('../../models/Ride');
const nodeDate = require('../nodeDate');

class RideTimeController{
	constructor(user) {
		this.user = user;
		this.ride = Ride;
		this.dateOp = Object.create(nodeDate);
	}

	async getMyRidesOnDate(date) {
		if (typeof date != 'string' || !date.trim()) {
			throw new Error('Internal server error: date is not defined');
		}
		const today = this.dateOp.calculateDateNumber(date) + 86400;
		const rides = await this.ride.find({
			status: {'$eq': 'active'},
			dateNumber: {'$gte': this.dateOp.calculateDateNumber(date), '$lte': today},
			'reservations.user': this.user._id
		});

		return rides;
	}

	async getReservationsForRate(){
		const today = new Date().getTime();

		const reservations = await this.ride.find(
				{dateNumber: {'$lte':today}, status: 'active'}
			)
			.select('reservations route.user route._id');

		return reservations;
	}

	async deactivateRides() {
		const today = new Date().getTime();

		const rides = await this.ride.update(
			{dateNumber: {'$lte':today}, status: 'active'},
			{$set: {status: 'done'}}
		);

		return rides;
	}

	async getRouteRideOnDate(route, date){
		if (typeof route != 'string' || !route.trim()) {
			throw new Error('Internal server error: route is not defined');
		}
		if (typeof date != 'string' || !date.trim()) {
			throw new Error('Internal server error: date is not defined');
		}
		const today = this.dateOp.calculateDateNumber(date) + 86400;
		const ride = await this.ride.findOne({
			'route._id': {'$eq': route},
			status: {'$eq': 'active'},
			dateNumber: {'$gte': this.dateOp.calculateDateNumber(date), '$lte': today}
		});

		return ride;
	}

	async isRideOverLapping(date, time) {
		if (typeof date != 'string' || !date.trim()) {
			throw new Error('Internal server error: date is not defined');
		}
		if (typeof time != 'string' || !time.trim() || time.length != 5) {
			throw new Error('Internal server error: time is not defined');
		}
		const rides = await this.getMyRidesOnDate(date);
		for (var i = 0; i < rides.length; i++) {
			if (!this.dateOp.isTimeDifferenceBiggerThanOneHour(this.dateOp.calculateTimeNumber(rides[i].route.time), this.dateOp.calculateTimeNumber(time))) {
				return true;
			}
		}

		return false;
	}


}

module.exports = RideTimeController;