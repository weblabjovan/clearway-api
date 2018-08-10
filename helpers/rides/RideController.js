const mongoose = require('mongoose');
const Ride = require('../../models/Ride');
const userDecorater = require('../users/userDecorater');

class RideController{
	constructor(user) {
		this.user = user;
		this.ride = Ride;
	}

	async createRide(route, params, dateNumber) {
		const ride = new Ride({
			route: route,
			reservations: [{
				user: this.user._id,
				start: params.start,
				startPoint: params.startObj,
				end: params.end,
				endPoint: params.endObj,
				status: 'sent',
				statusChange: true
			}],
			date: params.date,
			dateNumber: dateNumber,
			status: 'active',
			issueDate: Date.now()
		});

		return ride;
	}

	async changeReservationStatus(id, status) {
		let change = true;
		if (status == 'canceled' || status == 'declined') {
			change = false;
		}
		const ride = await this.ride.findOneAndUpdate(
			{'reservations._id': id },
			{$set: {'reservations.$.status': status, 'reservations.$.statusChange': change}}
		)
	}

	async preparePassangerRides(rides) {
		const res = [];
		for (var i = 0; i < rides.length; i++) {
			const newRoute = await userDecorater(rides[i].route);
			rides[i].newRoute = newRoute;

			const newRes = rides[i].reservations.filter( reservation => {
				return reservation.user == this.user._id;
			});

			rides[i].reservations = newRes;

			res.push(rides[i]);
		}

		return res;
	}

	async getMyPassangerRides() {
		const rides = await this.ride.find({
			status: {'$eq': 'active'},
			'reservations.user': this.user._id,
			'reservations.status': {'$ne': 'unactive'}
		});

		return await this.preparePassangerRides(rides);
	}

	async prepareDriverRides(rides) {
		const newRides = await Promise.all( rides.map( async (ride) => {
			const newResArr = await Promise.all(ride.reservations.map( async (reservation) => {
				const newRes = await userDecorater(reservation);

				return await newRes;
			}));
			ride.reservations = newResArr;

			return ride;
		}));

		return newRides;
	}

	async getMyDriverRides() {
		const rides = await this.ride.find({
			status: {'$eq': 'active'},
			'route.user': this.user._id
		});

		return await this.prepareDriverRides(rides);
	}

	async getRideForRating(reservationId) {
		const reservations = await this.ride.findOne({
			'reservations._id': reservationId
		}).select('reservations route.time dateNumber');

		const res = reservations.reservations.filter( reservation => {
			if (reservation._id == reservationId) {
				return reservation;
			};
		});
		
		return {reservation: res[0], time: reservations.route.time, date: reservations.dateNumber};
	}

}

module.exports = RideController;