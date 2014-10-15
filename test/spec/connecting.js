'use strict';

var socket = require('socket.io-client');

module.exports = function(ctx) {
	return function() {

		it('should require a token', function(done) {

			var client = socket(this.server, { multiplex: false });

			client.on('connect', function() {
				return done(new Error('Connected without token'));
			});

			client.on('error', function(err) {
				err.should.be.a.String; return done();
			});
		});

		it('should open connection when given a token', function(done) {

			var client = socket(this.server, {
				'query':     'access-token=user',
				'multiplex': false,
			});

			client.on('connect', function() {
				ctx.client = client; return done();
			});

			client.on('error', done);
		});
	}
}
