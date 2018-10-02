const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const keys = require('../keys/keys');
const jwtDecode = require('jwt-decode');
const UserController = require('../helpers/users/UserController');

const s3 = new AWS.S3({
	accessKeyId: keys.accessKeyId,
	secretAccessKey: keys.secretAccessKey,
	signatureVersion: 'v4',
	region: 'us-east-2'
});

module.exports = app => {

	app.get('/api/user/photoUpload/:user', (req, res) => {
		const userController = new UserController();
		const decoded = jwtDecode(req.params.user);
		if (userController.isUser(decoded.sub)) {
			const key = `${decoded.sub}/${uuid()}.jpg`;
			const url = s3.getSignedUrl('putObject', 
			{
				Bucket: 'claro-profile-bucket',
				ContentType: 'image/jpeg',
				Key: key
			});

			res.status(200).send({key, url});
		}else{
			res.status(401).json({error: 'Neautorizovano korišćenje.' });
		}
		
	})

}