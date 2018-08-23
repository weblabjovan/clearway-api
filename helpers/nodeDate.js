const momentZone = require('moment-timezone');
const moment = require('moment');

const nodeDate = {
	date: null,
	timezone: 'Europe/Belgrade',
	offset: '+0200',
	init: function(date){
		this.date = date;
	},
	getOnlyTime: function() {
		return moment(momentZone.tz(this.date, this.timezone).format()).format('HH:mm');
	},
	getActivatedAt: function() {
		let d = new Date();
		d.setHours(0,0,0,0);
		return d.getTime();
	},
	isTimeDifferenceBiggerThanOneHour: function(timeNum1, timeNum2) {
		if (Math.abs(timeNum1 - timeNum2) > 59) {
			return true;
		}

		return false;
	},
	isWeekend: function() {
		const d = new Date(this.date);
		if (d.getDay() === 6 || d.getDay() === 0) {
			return true;
		}

		return false;
	},
	isToday: function() {
		let inputDate = new Date(this.date);
		let todaysDate = new Date();
		
		if(inputDate.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
		    return true;
		}
		return false;
	},
	isTomorrow: function() {
		let inputDate = new Date(this.date);
		let tomorrowDate = new Date();
		tomorrowDate.setDate(tomorrowDate.getDate()+1);

		if(inputDate.setHours(0,0,0,0) == tomorrowDate.setHours(0,0,0,0)) {
		    return true;
		}
		return false;
	},
	calculateTimeNumber: function(time) {
		return (parseInt(time.substr(0,2)) * 60) + parseInt(time.substr(3,2));
	},
	calculateDateNumber: function(date) {
		return new Date(date).getTime();
	}

}

module.exports = nodeDate;