const distanceMeter = require('./distanceMeter');

module.exports = (routes, startObj, endObj) => {

	return routes.filter( route => {
		let start = false;
		let end = false;
		
		route.steps.map( (step, index) => {
			if (distanceMeter(step, startObj) < 150) {

				start = index;
			}
			if (distanceMeter(step, endObj) < 150) {
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