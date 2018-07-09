const momentZone = require('moment-timezone');
const moment = require('moment');

const nodeDate = {
	date: null,
	timezone: 'Europe/Belgrade',
	init: function(date){
		this.date = date;
	},
	createDate: function() {
		return momentZone.tz(this.date, this.timezone).format();
	},
	getOnlyTime: function() {
		return moment(momentZone.tz(this.date, this.timezone).format()).format('HH:mm');
	},
	getActivatedAt: function() {
		let d = new Date();
		d.setHours(0,0,0,0);
		return d.getTime();
	}

}

module.exports = nodeDate;