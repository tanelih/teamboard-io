'use strict';

exports.config = {
	'app_name':    [ 'teamboard-io' ],
	'license_key': process.env.NEW_RELIC_LICENSE_KEY,
	'agent_enabled': false,
	'rules': {
		'ignore': [
			'^/socket.io/.*'
		]
	}
}
