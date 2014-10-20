'use strict';

var server = require('./server');
var config = require('./config');

server.listen(config.port);
console.log('socket.io listening at port: ', config.port);
