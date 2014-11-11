'use strict';

exports.config = {
	'app_name':    [ 'teamboard-io' ],
	'license_key': process.env.NEW_RELIC_LICENSE_KEY,
	'rules': {
		'ignore': [
			'^/socket.io/.*'
		]
	}
}
