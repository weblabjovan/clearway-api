const mongoose = require('mongoose');
const User = require('../../models/User');

class UserController{
	constructor() {
		this.user = User;
	}

	async getUserById(id) {
		const user = this.user.findOne({
			_id: id
		}).select('-password');

		return user;
	}

	async isUser(userId) {
		const user = this.getUserById(userId);
		if (user) {
			return true;
		}else{
			return false;
		}
	}

	async updateUserRating(data) {
		let update = {};
		if (data.type == 'driver') {
			update['passengerSumm'] = data.rating;
			update['passengerNo'] = 1;
		}else{
			update['driverSumm'] = data.rating;
			update['driverNo'] = 1;
		}

		await this.user.findOneAndUpdate(
			{_id: data.id},
			{'$inc': update}
		)
	}

}

module.exports = UserController;