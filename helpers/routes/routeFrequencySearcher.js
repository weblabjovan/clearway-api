function getWeekendState(date) {
	const d = new Date(date);
	if (d.getDay() === 6 || d.getDay() === 0) {
		return 2;
	}

	return 1;
}

function getFutureState(date) {
	let inputDate = new Date(date);
	let todaysDate = new Date();
	let tomorrowDate = new Date();
	tomorrowDate.setDate(todaysDate.getDate()+1);
	
	if(inputDate.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
	    return 1;
	}
	if(inputDate.setHours(0,0,0,0) == tomorrowDate.setHours(0,0,0,0)) {
	    return 2;
	}
	return 3;
}

module.exports = (date) => {
	let freq = [3];

	if (getWeekendState(date) == 1) {
		freq.push(4);
	}else{
		freq.push(5);
	}

	if (getFutureState(date) == 1) {
		freq.push(1);
	}else{
		freq.push(2);
	}

	return freq;

}