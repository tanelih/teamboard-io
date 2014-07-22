'use strict';


module.exports = function(next) {
	return function(data, callback) {
		return next(data, (typeof callback === 'function') ?
			callback : function() { });
	}
}
