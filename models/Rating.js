const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
	user: {type: String, required: true},
	ratedUser: {type: String, required: true},
	timeRate: {type: Number, default: 0},
	moneyRate: {type: Number, default: 0},
	commRate: {type: Number, default: 0},
	averageRate: {type: Number, default: 0},
	route: {type: String, required: true},
	reservation: {type: String, required: true},
	status: {type: String, required: true},
	createDate: {type: String, required: true}
});


const Rating = mongoose.model('ratings', ratingSchema);

module.exports = Rating;