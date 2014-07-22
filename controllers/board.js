'use strict';


var utils = require('../utils');

module.exports.join = function(socket) {
	return utils.callback(utils.required(['board'],
		function(data, callback) {

			var resource = 'boards/' + data.board + '';

			socket.request.get(resource, function(err, board) {

				if(err) {
					return callback(err);
				}

				var eventData = {
					user:  socket.request.user.id,
					board: board.id
				}

				socket.join(board.id);
				socket.to(board.id).emit('board:join', eventData);

				return callback(null, eventData);
			});
		}));
}

module.exports.leave = function(socket) {
	return utils.callback(utils.required(['board'],
		function(data, callback) {

			var resource = 'boards/' + data.board + '';

			socket.request.get(resource, function(err, board) {

				if(err) {
					return callback(err);
				}

				var eventData = {
					user:  socket.request.user.id,
					board: board.id
				}

				socket.leave(board.id);
				socket.to(board.id).emit('board:leave', eventData);

				return callback(null, eventData);
			});
		}));
}
