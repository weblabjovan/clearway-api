const mongoose = require('mongoose');
const User = require('../models/User');
const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const keys = require('../keys/keys');
const passport = require('passport');
const passportConf = require('../helpers/passport');
const jsonWebToken = require('../helpers/jsonWebToken');

AWS.config.correctClockSkew = true;

const s3 = new AWS.S3({
	accessKeyId: keys.accessKeyId,
	secretAccessKey: keys.secretAccessKey,
	signatureVersion: 'v4',
	region: 'us-east-2'
});

module.exports = app => {

	app.get('/api/user/photoUpload', passport.authenticate('jwt', { session: false }), (req, res) => {
		if (req.user) {
			const key = `${req.user.id}/${uuid()}.jpeg`;

			s3.getSignedUrl('putObject', 
			{
				Bucket: 'clearway-profile',
				ContentType: 'image/jpeg',
				Key: key
			}, 
			(err, url) => res.send({key, url}))

		}
		
	})

}