'use strict';

var server = require('./server');
var config = require('./config');

server.listen(config.port);
console.log('Server listening at', config.port);
