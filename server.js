'use strict';

var nr      = require('newrelic');
var io      = require('socket.io')();
var redis   = require('socket.io-redis')
var request = require('request');

var config = require('./config');

/**
 * Do nothing.
 */
var noop = function() { }

/**
 * Quick utility to end 'newrelic' transactions while returning 'null'.
 */
var ok = function() {
	nr.endTransaction();
	return null;
}

/**
 * Quick error-utility to make 'newrelic' aware of errors and end any ongoing
 * transactions.
 */
var error = function(err) {
	nr.noticeError(err);
	nr.endTransaction();
	return err;
}

/**a
 * Set Redis as our 'MemoryStore' for much scalability.
 */
io.adapter(redis({
	host: config.redis.host,
	port: config.redis.port
}));

/**
 * Authenticate incoming requests.
 */
io.use(nr.createWebTransaction('/websocket/handshake', function(socket, next) {
	var token = socket.request._query['access-token'];

	if(!token) {
		return next(error.call(this, new Error('Authorization required')));
	}

	var options = {
		'url': config.api + '/auth',
		'headers': {
			'Authorization': 'Bearer ' + token + ''
		}
	}

	request.get(options, nr.createBackgroundTransaction('get:user',
		function(err, res, body) {
			if(err) {
				return next(error.call(this, err));
			}

			if(res.statusCode != 200) {
				return next(error.call(this, new Error(body)));
			}

			socket.request.user       = JSON.parse(body);
			socket.request.user.token = token;

			return next(ok.call(this));
		}));
}));

/**
 * Handler for the 'leave' and 'join' requests.
 *
 * TODO must be rewritten once Socket.IO 1.2.0 comes out as it adds the
 *      'clients' method which can be used to 'hopefully' retrieve the clients
 *      connected to a specific room across the server instances. With the
 *      'clients' method we can send a list of connected users on join.
 */
function handler(socket, type) {
	return nr.createWebTransaction('/websocket/' + type + '',
		function(payload, callback) {
			// Make sure callback is something that can be called.
			callback = typeof(callback) == 'function' ? callback : noop;

			var options = {
				'url': config.api + '/boards/' + payload.board + '',
				'headers': {
					'Authorization': 'Bearer ' + socket.request.user.token + ''
				}
			}

			// Get the board specified in 'payload.board'.
			request.get(options, nr.createBackgroundTransaction('get:board',
				function(err, res, body) {
					if(err) return callback(error.call(this, err));

					if(res.statusCode != 200) {
						return callback(error.call(this, new Error(body)));
					}

					var board = JSON.parse(body);

					socket.join(board.id).to(board.id)
						.emit('board:' + type + '', {
							'user':  socket.request.user.id,
							'board': board.id
						});

					return callback(ok.call(this));
				}));
		});
}

/**
 * Setup listeners for a connected client.
 */
io.sockets.on('connection', function(socket) {
	socket.on('board:join',  handler(socket, 'join'));
	socket.on('board:leave', handler(socket, 'leave'));
});

module.exports = io;
