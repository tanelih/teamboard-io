'use strict';

// var io     = require('./server');
var config = require('./config');

var request = require('request');

request.get(config.api + '/auth', function(err, res, body) {
	console.log(err, res, body);
});

// io.listen(config.port);
console.log('socket.io listening at port: ', config.port);
