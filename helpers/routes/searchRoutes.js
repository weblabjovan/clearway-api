const distanceMeter = require('./distanceMeter');

module.exports = (routes, startObj, endObj, distance) => {

	return routes.filter( route => {
		let start = false;
		let end = false;
		
		route.steps.map( (step, index) => {
			if (distanceMeter(step, startObj) < distance) {

				start = index;
			}
			if (distanceMeter(step, endObj) < distance) {
				end = index;
			}
		});

		if (typeof start === 'number' && typeof end === 'number') {
			if (start < end) {
				return route;
			}
		};
	});
}