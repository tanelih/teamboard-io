'use strict';

module.exports = {
	redis: {
		opts: {
			auth_pass: process.env.REDIS_PASS
		},
		port: process.env.REDIS_PORT || 6379,
		host: process.env.REDIS_HOST || 'localhost'
	},
	api:  process.env.API_URL || 'http://localhost:9002/api',
	port: process.env.PORT    || 9001
}
