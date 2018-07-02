const distanceMeter = require('./distanceMeter');

function calculateBearing(point1, point2) {
	const y = Math.sin(point2.lng-point1.lng) * Math.cos(point2.lat);
	const x = Math.cos(point1.lat)*Math.sin(point2.lat) -
	        Math.sin(point1.lat)*Math.cos(point2.lat)*Math.cos(point2.lng-point1.lng);
	const brng = Math.atan2(y, x);

	return brng;
}

function calculateLatLngPoint(distance, startPoint, bearing) {
	const R = 6378137;

	const lat1 = startPoint.lat * (Math.PI / 180);
	const lon1 = startPoint.lng * (Math.PI / 180);

	let lat2 = Math.asin( Math.sin(lat1)*Math.cos(distance/R) +
	     Math.cos(lat1)*Math.sin(distance/R)*Math.cos(bearing))

	let lon2 = lon1 + Math.atan2(Math.sin(bearing)*Math.sin(distance/R)*Math.cos(lat1),
	             Math.cos(distance/R)-Math.sin(lat1)*Math.sin(lat2))

	lat2 = lat2 * (180 / Math.PI);
	lon2 = lon2 * (180 / Math.PI);

	return {lat: lat2, lng: lon2};
}

function calculateInterstepsDistance(distance) {
	const interSteps = [];
	for (var i = 0; i < Math.round(distance/200); i++) {
		interSteps.push((i+1)*(distance / Math.ceil(distance/200)));
	}

	return interSteps;
}

function isGreaterDistance(stepStart, stepEnd) {
	if (distanceMeter(stepStart, stepEnd) > 200) {
		return true;
	}

	return false;
}

function decorateStep(distance, stepStart, stepEnd){
	const intersteps = calculateInterstepsDistance(distance);
	const bearing = calculateBearing(stepStart, stepEnd);
	let newSteps = [];
	intersteps.map( step => {
		newSteps.push(calculateLatLngPoint(step, stepStart, bearing));
	});

	return newSteps;
}

module.exports = (steps) => {
	let newSteps = [];

	for (var i = 0; i < steps.length; i++) {
		newSteps.push(steps[i]);
		if (i < steps.length-1) {
			if (isGreaterDistance(steps[i], steps[i+1])) {
				const betweenSteps = decorateStep(distanceMeter(steps[i], steps[i+1]), steps[i], steps[i+1]);
				betweenSteps.map( step => {
					newSteps.push(step);
				})
			}
		}
	}

	return newSteps;
}