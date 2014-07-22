'use strict';


describe('controllers/board', function() {

	before(function(done) {
		this.client = require('socket.io-client')(this.server, {
			multiplex: false, query: 'access-token=123ASD' });
		this.client.on('connect', done);
	});

	var clientInsideRoom = null;
	var clientOutsideRoom = null;

	before(function(done) {
		clientInsideRoom = require('socket.io-client')(this.server, {
			multiplex: false, query: 'access-token=123ASD' });
		clientInsideRoom.on('connect', function() {
			clientInsideRoom.emit('board:join', { board: 'YYZ123' }, done);
		});
	});

	before(function(done) {
		clientOutsideRoom = require('socket.io-client')(this.server, {
			multiplex: false, query: 'access-token=123ASD' });
		clientOutsideRoom.on('connect', done);
	});

	// make sure there are no listeners attached before running tests
	// to prevent any duplicate done calls etc...
	beforeEach(function() {
		clientInsideRoom.removeAllListeners('board:join');
		clientInsideRoom.removeAllListeners('board:leave');
		clientOutsideRoom.removeAllListeners('board:join');
		clientOutsideRoom.removeAllListeners('board:leave');
	});

	describe('board:join', function() {

		it('should require the board id', function(done) {
			this.client.emit('board:join', { asd: 'asd' }, function(err, data) {

				err.should.be.ok;
				err.should.be.a.String;

				return done();
			});
		});

		it('should respond with board and user data', function(done) {
			this.client.emit('board:join', { board: 'YYZ123' },
				function(err, data) {

					if(err) {
						return done(err);
					}

					data.should.be.an.Object;
					data.should.have.properties(['user', 'board']);

					// we return only identifiers
					data.user.should.be.a.String;
					data.board.should.be.a.String;

					return done();
				});
		});

		it('should broadcast to the board', function(done) {

			clientInsideRoom.on('board:join', function(data) {

				data.should.be.an.Object;
				data.should.have.properties(['user', 'board']);
				data.board.should.equal('YYZ123');

				return done();
			});

			var testClient = require('socket.io-client')(this.server, {
				multiplex: false, query: 'access-token=123ASD' });
			testClient.on('connect', function() {
				testClient.emit('board:join', { board: 'YYZ123' });
			});
		});

		it('should not broadcast globally', function(done) {

			clientOutsideRoom.on('board:join', function(data) {
				return done(new Error('Join was broadcasted globally'));
			});

			clientInsideRoom.on('board:join', function(data) {
				return done();
			});

			var testClient = require('socket.io-client')(this.server, {
				multiplex: false, query: 'access-token=123ASD' });
			testClient.on('connect', function() {
				testClient.emit('board:join', { board: 'YYZ123' });
			});
		});
	});

	describe('board:leave', function() {

		it.skip('should require the board id');
		it.skip('should respond with board and user data');
		it.skip('should broadcast to the board');
		it.skip('should not broadcast globally');
	});
});