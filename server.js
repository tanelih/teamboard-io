'use strict';

var redis         = require('redis');
var request       = require('request');
var socketIO      = require('socket.io');
var socketIORedis = require('socket.io-redis');

var io     = socketIO();
var config = require('./config');

/**
 * Do nothing.
 */
var noop = function() { }

/**
 * Set Redis as our 'MemoryStore' for much scalability.
 *
 * NOTE We need to create custom pub and sub clients because of authentication
 *      set in the cloud.
 */
var pubClient = redis.createClient(
	config.redis.port, config.redis.host, {
		auth_pass: config.redis.opts.auth_pass
	}
);

var subClient = redis.createClient(
	config.redis.port, config.redis.host, {
		auth_pass:      config.redis.opts.auth_pass,
		detect_buffers: true
	}
);

pubClient.on('error', console.log);
subClient.on('error', console.log);

io.adapter(socketIORedis({
	pubClient: pubClient,
	subClient: subClient
}));

/**
 * Configuration for 'jarmo-socket.io'.
 */

process.env.INSTANCE_NAME =
	process.env.INSTANCE_NAME || process.env.HOSTNAME || 'unknown';

io.use(require('jarmo-socket.io')({
	/**
	 * When clients are connected, report InfluxDB compliant payload to the
	 * Jarmo service.
	 */
	onConnect: function(socket, numConn) {
		return {
			tags: {
				version:  process.env.VERSION || 'unknown',
				hostname: process.env.INSTANCE_NAME
			},
			fields: {
				value: numConn
			},
			name: '' + process.env.INSTANCE_NAME + '.num_connection'
		}
	},

	/**
	 * When clients are disconnected, report InfluxDB compliant payload to the
	 * Jarmo service.
	 */
	onDisconnect: function(socket, numConn, connDuration) {
		return [{
			tags: {
				version:  process.env.VERSION || 'unknown',
				hostname: process.env.INSTANCE_NAME
			},
			fields: {
				value: numConn
			},
			name: '' + process.env.INSTANCE_NAME + '.num_connection'
		}, {
			tags: {
				version:  process.env.VERSION || 'unknown',
				hostname: process.env.INSTANCE_NAME
			},
			fields: {
				value: connDuration
			},
			name: '' + process.env.INSTANCE_NAME + '.conn_duration'
		}]
	},

	// General Jarmo configuration...
	host: process.env.JARMO_HOST,
	port: process.env.JARMO_PORT
}));

/**
 * Authenticate incoming requests.
 */
io.use(function handshake(socket, next) {
	var token = socket.request._query['access-token'];

	if(!token) {
		return next(new Error('Authorization required'));
	}

	var options = {
		'url': config.api + '/auth',
		'headers': {
			'Authorization': 'Bearer ' + token + ''
		}
	}

	request.get(options, function(err, res, body) {
		if(err) {
			return next(err);
		}

		if(res.statusCode != 200) {
			return next(new Error(body));
		}

		socket.request.user       = JSON.parse(body);
		socket.request.user.token = token;
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

		var options = {
			'url': config.api + '/boards/' + payload.board + '',
			'headers': {
				'Authorization': 'Bearer ' + socket.request.user.token + ''
			}
		}

		// Get the board specified in 'payload.board'.
		request.get(options, function(err, res, body) {
			if(err) return callback(err);

			if(res.statusCode != 200) {
				return callback(new Error(body));
			}

			var board = JSON.parse(body);

			socket.join(board.id).to(board.id)
				.emit('board:' + type + '', {
					'user':  socket.request.user.id,
					'board': board.id
				});
			return callback();
		});
	}
}

/**
 * Setup listeners for a connected client.
 */
io.sockets.on('connection', function(socket) {

	socket.on('board:ping', function(payload) {
		// TODO check that the socket is actually in the room we are pinging
		socket.to(payload.board).emit('board:event', {
			type:  'BOARD_PING',
			user:  payload.user,
			board: payload.board
		});
	});

	socket.on('ticket:activity', function(payload) {
		// TODO check that the socket is actually in the room we are pinging
		socket.to(payload.board).emit('board:event', {
			type:   'TICKET_ACTIVITY',
			user:   payload.user,
			board:  payload.board,
			ticket: payload.ticket
		});
	});

	socket.on('board:join',  handler(socket, 'join'));
	socket.on('board:leave', handler(socket, 'leave'));
});

module.exports = io;
