const nodeDate = require('../nodeDate');

module.exports = (date) => {
	let freq = [3];
	const nDate = Object.create(nodeDate);
	nDate.init(date);

	if (nDate.isWeekend()) {
		freq.push(5);
	}else{
		freq.push(4);
	}

	if (nDate.isToday()) {
		freq.push(1);
	}else{
		freq.push(2);
	}

	return freq;

}