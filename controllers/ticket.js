'use strict';


var utils = require('../utils');

module.exports.create = function(socket) {
	return utils.callback(utils.required(['board', 'ticket'],
		function(data, callback) {

			var resource = 'boards/' + data.board + '/tickets';

			socket.request.post(resource, data.ticket, function(err, ticket) {

				if(err) {
					return callback(err);
				}

				return callback(null, ticket);
			});
		}));
}

module.exports.update = function(socket) {
	return utils.callback(utils.required(['board', 'ticket'],
		function(data, callback) {

			var bid = data.board;
			var tid = data.ticket.id;

			var resource = 'boards/' + bid + '/tickets/' + tid + '';

			socket.request.put(resource, data.ticket, function(err, ticket) {

				if(err) {
					return callback(err);
				}

				return callback(null, ticket);
			});
		}));
}

module.exports.remove = function(socket) {
	return utils.callback(utils.required(['board', 'ticket'],
		function(data, callback) {

			var bid = data.board;
			var tid = data.ticket.id;

			var resource = 'boards/' + bid + '/tickets/' + tid + '';

			socket.request.delete(resource, function(err, ticket) {

				if(err) {
					return callback(err);
				}

				return callback(null, ticket);
			});
		}));
}
