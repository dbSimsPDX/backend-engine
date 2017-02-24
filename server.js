
const http = require('http');
const app = require('./lib/app');
require('mongoose');

const findAndUpdate = require('./lib/update-user');
// const User = require('./lib/models/user.model');


require('./lib/connection');

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log('server is running on ', server.address());
});

setInterval(findAndUpdate, 86400);