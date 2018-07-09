const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservationSchema = new Schema({
	issuer: {type: String, required: true},
	route: {type: String, required: true},
	start: {type: String, required: true},
	end: {type: String, required: true},
	rideDate: {type: String, required: true},
	status: {type: String, required: true},
	issueDate: {type: String, required: true}
});


const Reservation = mongoose.model('reservations', reservationSchema);

module.exports = Reservation;