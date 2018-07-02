const userDecorater = require('../users/userDecorater');
const downsizeObject = require('../downsizeObject');

module.exports = async (searchArr) => {

	const res = searchArr.map( async obj => {
		const wantedFields = ['userObj', 'time', 'price', 'spots', 'end', 'start', '_id'];

		const x = await userDecorater(obj);
		const y = downsizeObject(x, wantedFields);
		
		return y;
	});

	return Promise.all(res);
}