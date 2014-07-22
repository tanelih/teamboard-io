'use strict';

var io     = require('./server');
var config = require('./config');

io.listen(config.port);
