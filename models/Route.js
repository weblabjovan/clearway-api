const mongoose = require('mongoose');
const { Schema } = mongoose;

const routeSchema = new Schema({
	user: {type: String, required: true},
	start: {type: String, required: true},
	end: {type: String, required: true},
	time: {type: String, required: true},
	frequency: {type: Number, required: true},
	spots: {type: Number, required: true},
	price: {type: Number, required: true},
	waypoints: {type: Array, required:  true},
	steps: {type: Array, required:  true},
	status: {type: String, required:  true},
	activatedAt: {type: Number, required:  true}
});


const Route = mongoose.model('routes', routeSchema);

module.exports = Route;