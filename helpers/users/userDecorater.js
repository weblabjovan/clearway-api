const mongoose = require('mongoose');
const User = require('../../models/User');

module.exports = async (obj) => {
	let res = {...obj};
	res = res._doc;
	const user = await User.findOne({_id: obj.user}).select('-password');
	res.userObj = user;
	
	return res;
}