'use strict';

var io      = require('socket.io')();
var redis   = require('socket.io-redis')
var request = require('request');

var config = require('./config');

/**
 * Do nothing.
 */
var noop = function() { }

/**
 * Set Redis as our 'MemoryStore' for much scalability.
 */
io.adapter(redis({
	host: config.redis.host,
	port: config.redis.port
}));

/**
 * Authenticate incoming requests.
 */
io.use(function(socket, next) {
	var token = socket.request._query['access-token'];

	if(!token) {
		return next(new Error('Authorization required'));
	}

	request.get(config.api + '/auth', function(err, res, body) {
		if(err) {
			return next(err);
		}

		socket.request.user = JSON.parse(body);
		return next();
	});
});

/**
 * Handler for the 'leave' and 'join' requests.
 *
 * TODO must be rewritten once Socket.IO 1.2.0 comes out as it adds the
 *      'clients' method which can be used to 'hopefully' retrieve the clients
 *      connected to a specific room across the server instances. With the
 *      'clients' method we can send a list of connected users on join.
 */
function handler(socket, type) {
	return function(payload, callback) {
		// Make sure callback is something that can be called.
		callback = typeof(callback) == 'function' ? callback : noop;

		// The URL for our request.
		var url = config.api + '/boards/' + payload.board + '';

		// Get the board specified in 'payload.board'.
		request.get(url, function(err, res, body) {
			if(err) {
				return callback(err);
			}

			if(res.statusCode != 200) {
				return callback(new Error(body));
			}

			var board = JSON.parse(body);

			socket.join(board.id)
				.to(board.id).emit('board:' + type + '', {
					'user':  socket.request.user.id,
					'board': board.id
				});

			return callback(null);
		});
	}
}

/**
 * Setup listeners for a connected client.
 */
io.sockets.on('connection', function(socket) {
	socket.on('board:join',  handler(socket, 'join'));
	socket.on('board:leave', handler(socket, 'leave'));
});

module.exports = io;
