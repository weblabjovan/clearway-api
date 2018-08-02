const mongoose = require('mongoose');
const Route = require ('./Route');
const RouteSchema = Route.schema;
const { Schema } = mongoose;

const rideSchema = new Schema({
	route: RouteSchema,
	reservations: [{
		user:{type: String},
		start:{type: String},
		startPoint: {
			lat: {type: Number},
			lng: {type: Number},
		},
		end:{type: String},
		endPoint: {
			lat: {type: Number},
			lng: {type: Number},
		},
		status: {type: String, default: 'sent'},
		statusChange: {type: Boolean, default: true},
	}],
	date: {type: String, required: true},
	dateNumber: {type: Number, required: true},
	status: {type: String, required: true},
	issueDate: {type: String, required: true}
});


const Ride = mongoose.model('rides', rideSchema);

module.exports = Ride;