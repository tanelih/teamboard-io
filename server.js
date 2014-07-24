'use strict';


var io     = require('socket.io')();
var redis  = require('socket.io-redis')
var config = require('./config');

// use redis as central memory store for socket.io servers
io.adapter(redis({ host: config.redis.host, port: config.redis.port }));

// clients must provide a valid access-token
io.use(function(socket, next) {
	var token = socket.request._query['access-token'];

	if(!token) {
		return next(new Error('Token not found'));
	}

	var request = require('./utils/request')(token);

	socket.request.get = request.get;
	socket.request.get('auth', function(err, user) {

		if(err) {
			return next(err);
		}

		socket.request.user = user;

		return next();
	});
});

var controllers = require('./controllers');

io.sockets.on('connection', function(socket) {
	socket.on('board:join',  controllers.board.join(socket));
	socket.on('board:leave', controllers.board.leave(socket));
});

module.exports = io;
