#!/usr/bin/env node

var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var morgan = require('morgan');
var path = require('path');

var app = connect();

app.use(morgan('dev'));
app.use('/', serveStatic(path.join(__dirname, 'app')));

const port = 8001;
app.listen(port);

console.log('Server listening on port', port);
