const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const passport = require('passport');
const passportConf = require('../helpers/passport');
const jsonWebToken = require('../helpers/jsonWebToken');
const nodeDate = require('../helpers/nodeDate');

module.exports = app => {
	
	app.post('/api/reservation/save', passport.authenticate('jwt', { session: false }), async (req, res) => {

		const nDate = Object.create(nodeDate);
		nDate.init(req.body.rideDate);
		const newReservation = new Reservation({
			issuer: req.user.id,
			route: req.body.route,
			start: req.body.start,
			end: req.body.end,
			rideDate: nDate.createDate(),
			status: 'active',
			issueDate: Date.now()
		});

		try{
			await newReservation.save();
			res.status(200).send('New reservation made.');
		}catch(error){
			console.log(error);
			res.status(422).send(error);
		}
	})	
}