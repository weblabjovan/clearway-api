const JWT = require('jsonwebtoken');
const { secretJWT } = require('../keys/keys');

module.exports = (user) => {
	return JWT.sign({
		iss: 'Authorization',
		sub: user.id,
		iat: new Date().getTime(),
		exp: Math.floor(Date.now() / 1000) + (60 * 60)
	}, secretJWT );
}