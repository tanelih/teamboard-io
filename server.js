'use strict';


var io     = require('socket.io')();
var redis  = require('socket.io-redis')
var config = require('./config');

// setup redis storage adapter for scalability
io.adapter(redis({ host: config.redis.host, port: config.redis.port }));

// handshaking via authentication api
// requires connecting user to have a valid access-token
io.use(function(socket, next) {

	var token = socket.request._query['access-token'];

	if(!token) {
		return next(new Error('Token not found'));
	}

	var request = require('./utils/request')(token);

	socket.request.get    = request.get;
	socket.request.put    = request.put;
	socket.request.post   = request.post;
	socket.request.delete = request.delete;

	request.get('auth', function(err, user) {

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

	socket.on('ticket:create', controllers.ticket.create(socket));
	socket.on('ticket:update', controllers.ticket.update(socket));
	socket.on('ticket:remove', controllers.ticket.remove(socket));
});

module.exports = io;
