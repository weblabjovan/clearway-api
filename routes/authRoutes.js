const mongoose = require('mongoose');
const User = require('../models/User');
const passport = require('passport');
const passportConf = require('../helpers/passport');
const jsonWebToken = require('../helpers/jsonWebToken');
const Mailer = require('../helpers/Mailer');
const welcomeTemplate = require('../templates/emailTemplates/welcomeTemplate');
const passcodeTemplate = require('../templates/emailTemplates/passcodeTemplate');
const generator = require('generate-password');
const bcrypt = require('bcryptjs');
const keys = require('../keys/keys');

module.exports = app => {
	app.get('/api/auth/google', passport.authenticate('google', {
			scope: ['profile', 'email']
		})
	);

	app.get('/api/test', (req, res) => {
		res.status(200).send('Test is done!');
	})

	app.get('/api/auth/google/callback', passport.authenticate('google'), (req, res) => {
		if (req.user) {
			const token = jsonWebToken(req.user);
			console.log(keys.clientURI);
			res.redirect(keys.clientURI + '/dashboard/' + token);
		}else{
			res.status(400).json({error: 'Problem with Google Server'});
		}
	});

	app.post('/api/findUserByEmail', async (req, res) => {
		const user = await User.findOne({email: req.body.email});
		if (user) {
			const passcode = generator.generate({
			    length: 8,
			    numbers: true,
			    uppercase: true,
			    symbols: false
			});
			const updatedUser = await User.findOneAndUpdate({_id: user.id}, {passcode: passcode}, {new: true});
			const recipient = [req.body.email];
			const mailer = new Mailer('Password change code', recipient, passcodeTemplate(updatedUser));
			await mailer.send();
			res.status(200).send({email: req.body.email});
		}else{
			res.status(400).json({error: 'No user with provided email'});
		}
	});

	app.post('/api/checkPasscode', async (req, res) => {
		const { email, passcode } = req.body;
		const user = await User.findOne({email, passcode});
		if (user) {
			await User.update({_id: user.id}, {passcode: ''});
			res.status(200).send({passcode: true});
		}else{
			res.status(400).json({error: 'Invalid password change code'});
		}

	});

	app.post('/api/changePassword', async (req, res) => {
		const { email, password } = req.body;
		const user = await User.findOne({email});
		if (user) {
			const salt = await bcrypt.genSalt(10);
			const passHash = await bcrypt.hash(password, salt);
			await User.update({_id: user.id}, {password: passHash});
			res.status(200).send({change: true});
		}else{
			res.status(400).json({error: 'Server problems please refresh the page'});
		}
	})

	app.get('/api/user', passport.authenticate('jwt', { session: false }), (req, res) => {
		res.status(200).send(req.user);
	});

	app.get('/api/isUserLogged', passport.authenticate('jwt', { session: false }), (req, res) => {
		res.status(200).send({logged: true});
	});

	app.post('/api/user/login', passport.authenticate('local', { session: false }), async (req, res) => {
		if (req.user) {
			const token = jsonWebToken(req.user);
			res.status(200).send(token);
		}else{
			res.status(400).json({error: 'No user with provided data'});
		}
	});

	app.post('/api/user/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
		if (req.user) {
			await User.findById(req.user.id, function(err, user) {
				if (err) return res.status(400).send(err);

				for(var prop in req.body){
					if (prop === 'modelNumber' || prop === 'model' || prop === 'modelYear') {
						if (req.body.userType === 'true' || req.body.userType === true) {
							user.car[prop] = req.body[prop];
						}else{
							user.car[prop] = '';
						}
						
					}else{
						user[prop] = req.body[prop];
					}
				}

				user.save(function (err, updatedUser) {
				    if (err) return handleError(err);
				    res.send(updatedUser);
				});
			})
		};
	})

	app.post('/api/user/signup', async (req, res) => {
		const { sign_username, sign_email, sign_pass } = req.body;
		const user = await User.findOne({ email: sign_email });
		if (user) {
			res.status(403).json({error: 'User with this email already exists'});
		}else{
			const newUser = new User({
				username: sign_username,
				email: sign_email,
				password: sign_pass,
				date: new Date()
			})
			
			try{
				const recipient = [sign_email];
				const mailer = new Mailer('Welcome to Claro', recipient, welcomeTemplate(newUser));
				await mailer.send();
				await newUser.save();
				const token = jsonWebToken(newUser);
				res.status(200).send(token);
			}catch(err) {
				res.status(422).send(err);
			}	
		}
		
	});
}