'use strict';


var _ = require('lodash');

var config = {

	'common': {
		'port': process.env.PORT || 9001,
	},

	'development': {

		'api': 'http://localhost:9002',

		'redis': {
			'host': 'localhost',
			'port': 6379
		}
	},

	'production': {

		'api': process.env.API_URL,

		'redis': {
			'host': process.env.REDIS_HOST,
			'port': process.env.REDIS_PORT
		}
	}
}

module.exports = _.merge(config.common,
	config[process.env.NODE_ENV] || config.development);
