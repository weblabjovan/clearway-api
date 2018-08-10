const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
	user: {type: String, required: true},
	reference: {type: String, required: true},
	referenceType: {type: String, required: true},
	status: {type: String, required: true},
	createDate: {type: String, required: true}
});


const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;