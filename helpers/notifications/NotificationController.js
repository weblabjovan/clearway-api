const Notification = require('../../models/Notification');

class NotificationController{
	constructor() {
		this.notification = Notification;
	}

	async changeNotificationStatus(id, status) {
		await this.notification.findOneAndUpdate(
			{_id: id},
			{$set: {status: status}}
		);
	}

	async createNotification(data) {
		const notification = new Notification({
			user: data.user,
			reference: data.reference,
			referenceType: data.referenceType,
			status: 'active',
			createDate: Date.now()
		});

		return notification;
	}

	async createDailyNotifications(list) {
		await Promise.all(
			list.map( async item => {
				const newNotification = await this.createNotification({user: item.user, reference: item.reference, referenceType: item.type});
				await newNotification.save();
			})
		)
	}

	async getMyActiveNotifications(userId) {
		const notiications = await this.notification.find({
			status: 'active',
			user: userId
		});

		return notiications;
	}
}

module.exports = NotificationController;