'use strict';


var request = require('request');
var config  = require('../config');

var root = config.api.url + ':' + config.api.port + '/' +
	config.api.version + '/';

function _request(token, method) {
	return function(resource, data, callback) {

		var jsonstr = '';

		// if data is present stringify it, otherwise
		// callback was passed in as second argument
		if((typeof data === 'function') && !callback) {
			callback = data;
		}
		else if(typeof data === 'object') {
			jsonstr = JSON.stringify(data);
		}

		var opts = {
			url:     root + resource,
			data:    jsonstr,
			method:  method,
			headers: {
				'content-type':  'application/json',
				'authorization': 'bearer ' + token + ''
			}
		}

		request(opts, function(err, res, body) {

			if(err) {
				return callback(err);
			}

			if(res.statusCode >= 400) {
				var err        = new Error('HTTP Error');
				    err.status = res.statusCode;
				return callback(err);
			}

			var content = null;

			try {
				content = JSON.parse(body);
			}
			catch(parseError) {
				console.log('Error', parseError, '\nParsing', body);
			}

			return callback(null, content);
		});
	}
}

module.exports = function(token) {
	return {
		get: _request(token, 'GET')
	}
}
