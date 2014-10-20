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

		it('should require an existing board', function(done) {

			var payload = { 'board': 'notfound' }

			ctx.client.emit('board:join', payload, function(err) {
				if(err) {
					return done();
				}
				return done(new Error('Joined a non-existing board'));
			});
		});

		it('should not broadcast globally', function(done) {

			var cleanup = function(err, listener) {
				listener.destroy();
				return err ? done(err) : done();
			}

			var listener = testClient.on('board:join', cleanup.bind(null,
				new Error('\'board:join\' broadcasted globally'), listener));

			ctx.client.emit('board:join', { 'board': 'found' }, function(err) {
				return cleanup.bind(null, err, listener)();
			});
		});

		it('should broadcast to the room', function() {

			var listener = testClient.on('board:join', function() {
				return listener.destroy() && done();
			});

			testClient.emit('board:join', { 'board': 'found' }, function(err) {
				if(err) {
					return done(err);
				}
				ctx.client.emit('board:join', { 'board': 'found' });
			});
		});
	}
}
