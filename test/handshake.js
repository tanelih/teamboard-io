'use strict';


describe('handshaking', function() {

	it('should require a token', function(done) {

		var client = require('socket.io-client')(this.server, {
			multiplex: false });

		client.on('connect', function() {
			return done(new Error('Connected without token'));
		});

		client.on('error', function(err) {

			err.should.be.a.String;
			err.should.equal('Token not found');

			return done();
		});
	});

	it('should open connection when given a token', function(done) {

		// for testing purposes, the token is not validated in the mock API
		var client = require('socket.io-client')(this.server, {
			multiplex: false, query: 'access-token=123ASD' });

		client.on('connect', done);
		client.on('error',   done);
	});
});
