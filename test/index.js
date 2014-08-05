'use strict';


var io     = require('../server');
var nock   = require('nock');
var config = require('../config');

before(function() {

	var api = config.api.url + ':' + config.api.port + '';

	nock(api).persist()

		.get('/api/v1/auth')
			.replyWithFile(200, './test/mocks/user.json')

		.get('/api/v1/boards')
			.replyWithFile(200, './test/mocks/boards.json')

		.get('/api/v1/boards/YYZ123')
			.replyWithFile(200, './test/mocks/board.json')

		.post('/api/v1/boards/YYZ123/tickets', {
				heading: 'testi',
				content: 'testi'
			})
			.replyWithFile(201, './test/mocks/ticket.json');
});

before(function() {
	io.listen(config.port);
	this.server = 'http://localhost:' + config.port;
});
