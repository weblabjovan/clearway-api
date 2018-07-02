const moment = require('moment-timezone');

const nodeDate = {
	date: null,
	timezone: null,
	init: function(date, timezone){
		this.date = date;
		this.timezone = timezone;
	},
	createDate: function() {
		return moment.tz(this.date, this.timezone).format();
	},
	getActivatedAt: function() {
		let d = new Date();
		d.setHours(0,0,0,0);
		return d.getTime();
	}

}

module.exports = nodeDate;