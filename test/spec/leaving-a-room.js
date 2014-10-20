'use strict';

var socket = require('socket.io-client');

module.exports = function(ctx) {
	return function() {

		var testClient = null;

		before(function(done) {

			testClient = socket(this.server, {
				'query':     'access-token=user',
				'multiplex': false
			});

			testClient.on('error',   done);
			testClient.on('connect', done);
		});

		it.skip('should require the client to be in that room');

		it('should require an existing board', function(done) {

			// TODO Should the server actually validate if the board exists when
			//      leaving a board? This might cause problems when clients
			//      attempt to leave rooms that were just deleted.

			var payload = { 'board': 'notfound' }

			ctx.client.emit('board:leave', payload, function(err) {
				if(err) {
					return done();
				}
				return done(new Error('Left a non-existing board'));
			});
		});

		it('should not broadcast globally', function(done) {

			var cleanup = function(err, listener) {
				listener.destroy();
				return err ? done(err) : done();
			}

			var listener = testClient.on('board:leave', cleanup.bind(null,
				new Error('\'board:leave\' broadcasted globally'), listener));

			ctx.client.emit('board:leave', { 'board': 'found' }, function(err) {
				return cleanup.bind(null, err, listener)();
			});
		});

		it('should broadcast to the room', function() {

			var listener = testClient.on('board:leave', function() {
				return listener.destroy() && done();
			});

			ctx.client.emit('board:join', { 'board': 'found' },
				ctx.client.emit.bind(ctx.client, 'board:leave', {
					'board': 'found'
				}));
		});
	}
}
