'use strict';


module.exports = function(fields, next) {
	return function(data, callback) {
		for (var i = 0; i < fields.length; i++) {
			if(!data.hasOwnProperty(fields[i])) {
				return callback('Missing required field [' + fields[i] + ']');
			}
		}
		return next(data, callback);
	}
}