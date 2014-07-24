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

	var _test = function(action) {
		return function() {

			it('should require the board id', function(done) {
				this.client.emit('board:' + action + '', { asd: 'asd' },
					function(err, data) {

						err.should.be.ok;
						err.should.be.a.String;

						return done();
					});
			});

			it('should respond with board and user data', function(done) {
				this.client.emit('board:' + action + '', { board: 'YYZ123' },
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

				clientInsideRoom.on('board:' + action + '', function(data) {

					data.should.be.an.Object;
					data.should.have.properties(['user', 'board']);
					data.board.should.equal('YYZ123');

					return done();
				});

				var testClient = require('socket.io-client')(this.server, {
					multiplex: false, query: 'access-token=123ASD' });
				testClient.on('connect', function() {
					testClient.emit('board:' + action + '', { board: 'YYZ123' });
				});
			});

			it('should not broadcast globally', function(done) {

				clientOutsideRoom.on('board:' + action + '', function(data) {
					return done(new Error(
						'' + action + ' was broadcasted globally'));
				});

				clientInsideRoom.on('board:' + action + '', function(data) {
					return done();
				});

				var testClient = require('socket.io-client')(this.server, {
					multiplex: false, query: 'access-token=123ASD' });
				testClient.on('connect', function() {
					testClient.emit('board:' + action + '', { board: 'YYZ123' });
				});
			});
		}
	}

	describe('board:join',  _test('join'));
	describe('board:leave', _test('leave'));
});
