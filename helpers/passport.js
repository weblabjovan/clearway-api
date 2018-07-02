const passport = require('passport');
const JWTStartegy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const  { ExtractJwt } = require('passport-jwt');
const { secretJWT } = require('../keys/keys');
const User = require('../models/User');
const keys = require('../keys/keys');
const generator = require('generate-password');
const Mailer = require('./Mailer');
const welcomeTemplate = require('../templates/emailTemplates/welcomeTemplate');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.use( new GoogleStrategy({
	clientID: keys.googleID,
	clientSecret: keys.googleSecret,
	callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) =>{
	const email = profile.emails[0].value;
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return done(null, existingUser);
	}
	const password = generator.generate({
	    length: 8,
	    numbers: true,
	    uppercase: true,
	    symbols: true
	});
	
	const user = await new User({
		username: profile.displayName,
		email: profile.emails[0].value,
		password: password,
		date: new Date()
	});

	try{
		const recipient = [profile.emails[0].value];
		const mailer = new Mailer('Welcome to Claro', recipient, welcomeTemplate(user));
		await mailer.send();
		await user.save();
		done(null, user);
	}catch(err) {
		done(err, false);
	}

	
}))

passport.use( new JWTStartegy({
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
	secretOrKey: secretJWT
}, async (payload, done) =>{
	try{
		const user = await User.findById(payload.sub).select({password: false});
		
		if (!user) {
			return done(null, false);
		}
		done(null, user);
	}catch(error){
		done(error, false);
	}
}));

passport.use( new LocalStrategy({
	usernameField: 'log_email',
	passwordField : 'log_pass'
}, async (log_email, log_pass, done) => {
	try{
		const user = await User.findOne({email: log_email});
		if (!user) {
			return done(null, false);
		}

		const isValidPass = await user.isPassValid(log_pass);
		if (!isValidPass) {
			return done(null, false);
		}

		return done(null, user);
	}catch(error) {
		return done(error, false);
	}
	
}))