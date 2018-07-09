const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const keys = require('./keys/keys');
const passport = require('passport');

require('./models/User');

mongoose.connect(keys.mongoURI);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/routeRoutes')(app);
require('./routes/uploadRoutes')(app);
require('./routes/reservationRoutes')(app);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log('AUTH listening to the port ' + PORT);
})