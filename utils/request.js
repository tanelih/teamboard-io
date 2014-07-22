'use strict';


var config  = require('../config');
var request = require('request');

var api_root = config.api.host + ':' + config.api.port +
	'/api/' + config.api.version + '/';

var _responses = {
	'GET':    [ 200 ],
	'PUT':    [ 200 ],
	'POST':   [ 200, 201 ],
	'DELETE': [ 200 ]
}

function _request(token, method) {
	return function(resource, data, callback) {

		var json = '';

		if((typeof data === 'function') && !callback) {
			callback = data;
		}
		else if(typeof data === 'object') {
			json = JSON.stringify(data);
		}

		var opts = {
			url:     api_root + resource,
			data:    json,
			method:  method,
			headers: { 'authorization': 'Bearer ' + token }
		}

		request(opts, function(err, res, body) {

			if(err) {
				return callback(err);
			}

			if(_responses[method].indexOf(res.statusCode) < 0) {
				var err        = new Error('HTTP Error');
				    err.status = res.statusCode;
				return callback(err);
			}

			var parsed = null;

			try {
				parsed = JSON.parse(body);
			}
			catch(parseError) {
				console.log('Error', parseError, '\nParsing', body);
			}

			return callback(null, parsed);
		});
	}
}

module.exports = function(token) {
	return {
		get:    _request(token, 'GET'),
		put:    _request(token, 'PUT'),
		post:   _request(token, 'POST'),
		delete: _request(token, 'DELETE')
	}
}
