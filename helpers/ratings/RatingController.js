const Rating = require('../../models/Rating');

class RatingController{
	constructor() {
		this.rating = Rating;
	}

	async isForNewReservation(user) {
		const twoDaysBefore = new Date(Date.now() - 48 * 3600 * 1000);
		twoDaysBefore.setHours(0,0,0,0);

		const rating = await this.rating.find(
			{ $and: [
				{user: {$eq: user}}, 
				{createDate: {$lte: twoDaysBefore.getTime()}}
			]}
		);
		;
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
		let idArr = [];
		await Promise.all( 
			list.map( async (item, index) =>{
				const ratedUser = item.route.user;
				const route = item.route._id;

				await Promise.all(
					item.reservations.map( async reservation => {
						if (reservation.status === 'accepted') {
							const newPassRating = await this.createRating({ user: reservation.user, ratedUser: ratedUser, reservation: reservation._id, route: route});
							const newDriveRating = await this.createRating({ user: ratedUser, ratedUser: reservation.user, reservation: reservation._id, route: route});
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
		const rating = await this.rating.findOne({ _id: id });

		return rating;
	}

	
}

module.exports = RatingController;