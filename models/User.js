const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
	username: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	passcode: {type:String, default: ''},
	date: {type: Date, required: true},
	name: {type: String},
	phone: {type: String},
	gender: {type: String},
	birthYear: {type: Number},
	userType: {type: String},
	photo: {type: String},
	car: {
		model: {type: String},
		modelNumber: {type: String},
		modelYear: {type: Number},
		photo: {type: String}
	},
	driverSumm: {type: Number, default: 0},
	driverNo: {type: Number, default: 0},
	passengerSumm: {type: Number, default: 0},
	passengerNo: {type: Number, default: 0}
});

userSchema.pre('save', async function(next) {
	try{
		const salt = await bcrypt.genSalt(10);
		const passHash = await bcrypt.hash(this.password, salt);
		this.password = passHash;
		next();
	}catch(error){
		next(error);
	}
});

userSchema.methods.isPassValid = async function(newPass) {
	try{
		return await bcrypt.compare(newPass, this.password);
	}catch(error) {
		throw new Error(error);
	}
}

const User = mongoose.model('users', userSchema);

module.exports = User;