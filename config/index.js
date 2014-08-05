'use strict';


var _ = require('lodash');

var config = {
	common: {
		port: process.env.PORT || 9001,
		api:  { version: 'api/v1' }
	},
	development: {
		api: {
			url:  'http://localhost',
			port: 9002
		},
		redis: {
			host: 'localhost',
			port: 6379
		}
	},
	production: {
		api: {
			url:  process.env.API_URL,
			port: process.env.API_PORT
		},
		redis: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT
		}
	}
}

module.exports = _.merge(config.common,
	config[process.env.NODE_ENV] || config.development);
