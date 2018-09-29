const Rating = require('../../models/Rating');
const Ride = require('../../models/Ride');

class RatingController{
	constructor() {
		this.rating = Rating;
	}

	async isForNewReservation(user) {

		if (typeof user != 'string') {
			throw new Error('Internal server error: user type not correct');
		}

		const twoDaysBefore = new Date(Date.now() - 48 * 3600 * 1000);
		twoDaysBefore.setHours(0,0,0,0);

		const rating = await this.rating.find(
			{ $and: [
				{user: {$eq: user}}, 
				{timeRate: {$eq: 0}},
				{moneyRate: {$eq: 0}},
				{commRate: {$eq: 0}},
				{createDate: {$lte: twoDaysBefore.getTime()}}
			]}
		);

		if (rating.length > 0) { return false };

		return true;
	}

	async updateRating(data){
		await this.rating.findOneAndUpdate(
			{_id: data.id},
			{$set: {timeRate: data.time, moneyRate: data.money, commRate: data.comm}}
		);
	}

	async createRating(data) {
		if (typeof data.user != 'string' || typeof data.ratedUser != 'string' || typeof data.route != 'string' || typeof data.reservation != 'string' ) {
			throw new Error('Internal server error: new ratings data type not correct');
		}
		const rating = new Rating({
			user: data.user,
			ratedUser: data.ratedUser,
			timeRate: 0,
			moneyRate: 0,
			commRate: 0,
			averageRate: 0,
			route: data.route,
			reservation: data.reservation,
			status: 'active',
			createDate: Date.now()
		});

		return rating;
	}

	async createDailyRatings(list) {

		if (!Array.isArray(list)) {
			throw new Error('Internal server error: ratings list is not array');
		}

		if (list.length > 0) {
			if (list[0] instanceof Ride === false) {
				throw new Error('Internal server error: ratings list is not from the route model');
			}
		}

		let idArr = [];
		await Promise.all( 
			list.map( async (item, index) =>{
				const ratedUser = item.route.user;
				const route = JSON.stringify(item.route._id);

				await Promise.all(
					item.reservations.map( async reservation => {
						if (reservation.status === 'accepted') {
							const newPassRating = await this.createRating({ user: reservation.user, ratedUser: ratedUser, reservation: JSON.stringify(reservation._id), route: route});
							const newDriveRating = await this.createRating({ user: ratedUser, ratedUser: reservation.user, reservation: JSON.stringify(reservation._id), route: route});
							await newPassRating.save();
							await newDriveRating.save();
							idArr.push({user: newPassRating.user, reference: newPassRating._id, type: 'passenger'});
							idArr.push({user: newDriveRating.user, reference: newDriveRating._id, type: 'driver'});
						};
					})
				)
			})
		)

		return idArr;
	}

	async getRatingById(id) {

		if (typeof id != 'string') {
			throw new Error('Internal server error: id type not correct');
		}

		const rating = await this.rating.findOne({ _id: id });

		return rating;
	}

	
}

module.exports = RatingController;