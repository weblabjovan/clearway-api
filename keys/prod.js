module.exports = {
	clientURI: "http://clarotestfront.s3-website.us-east-2.amazonaws.com",
	mongoURI: process.env.MONGO_URI,
	secretJWT: process.env.SECRET_JWT,
	googleSecret: process.env.GOOGLE_SECRET,
	googleID: process.env.GOOGLE_ID,
	sendGridKey: process.env.SENDGRID_KEY,
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY
}