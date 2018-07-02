const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('./keys/keys');
const passport = require('passport');

require('./models/User');

mongoose.connect(keys.mongoURI);

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/routeRoutes')(app);
require('./routes/uploadRoutes')(app);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));

	const path = require('path');
	app.get('*', (req,res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log('AUTH listening to the port ' + PORT);
})