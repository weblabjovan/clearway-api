const distanceMeter = require('./distanceMeter');
const userDecorater = require('../users/userDecorater');
const downsizeObject = require('../downsizeObject');
const moment = require('moment');


function getClosestSteps(route, position){
	let start = null;
	let end = null;

	route.steps.map( (step, index) => {
		if (distanceMeter(step, position.startObj) < position.distance) {
			if (!start) {
				start = {step: index, distance: distanceMeter(step, position.startObj)}
			}else{
				if (distanceMeter(step, position.startObj) < start.distance) {
					start = {step: index, distance: distanceMeter(step, position.startObj)}
				}
			}
		}

		if (distanceMeter(step, position.endObj) < position.distance) {
			if (!end) {
				end = {step: index, distance: distanceMeter(step, position.endObj)}
			}else{
				if (distanceMeter(step, position.endObj) < end.distance) {
					end = {step: index, distance: distanceMeter(step, position.endObj)}
				}
			}
		}
	})

	return {start: start, end: end};
}

function calculateRideTime(steps){

	return Math.ceil((steps.end.step - steps.start.step)/3);
}

function calculateRideStart(startTime, startStep){
	const t = moment(startTime,'HH:mm').add(Math.ceil(startStep/3), 'minutes');

	return moment(t).format('HH:mm');
}

function calculateRideDiscount(stepsLength, start, end){
	return 100 - Math.ceil(((end-start)/stepsLength)*100);
}

module.exports = async (route, position) => {
	const steps = getClosestSteps(route, position);
	const rideTime = calculateRideTime(steps);
	const rideStart = calculateRideStart(route.time, steps.start.step);
	const rideDiscount = calculateRideDiscount(route.steps.length, steps.start.step, steps.end.step);
	const wantedFields = ['userObj', 'time', 'price', 'spots', 'end', 'start', '_id', 'rideTime', 'rideStart', 'rideDiscount', 'startDistance', 'rideDate'];

	let newRoute = await userDecorater(route);

	newRoute.rideTime = rideTime;
	newRoute.rideStart = rideStart;
	newRoute.rideDiscount = rideDiscount;
	newRoute.startDistance = steps.start.distance;
	newRoute.rideDate = position.date;
	newRoute = downsizeObject(newRoute, wantedFields);
	
	return newRoute;
}