const http = require('http');
const app = require('./lib/app');
// AFAICT, this isn't needed here
// require('mongoose');

const findAndUpdate = require('./lib/update-user');


require('./lib/connection');

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log('server is running on ', server.address());
});
// good to make big second number more visible
const interval = 1 /*day*/ * 24 /*hrs*/ * 60 /*min*/ * 60 /*sec*/ * 1000 /*ms*/;
setInterval(findAndUpdate, interval);