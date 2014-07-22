'use strict';


describe('controllers/ticket', function() {

	before(function(done) {
		this.client = require('socket.io-client')(this.server, {
			multiplex: false, query: 'access-token=123ASD' });
		this.client.on('connect', done);
	});

	describe('ticket:create', function(done) {

	});

	describe('ticket:update', function(done) {

	});

	describe('ticket:remove', function(done) {

	});
});
