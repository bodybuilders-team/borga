'use strict';


const default_port = 8888;
const port = process.argv[2] || default_port;

const guest_token = 'asasfscdf1-06db-4537-8aef-38845dfgd8';

const data_ext_games = require('./board-games-data.js');
const data_int = require('./borga-data-mem.js');

const services = require('./borga-services.js')(data_ext_games, data_int);

const webapi = require('./borga-web-api.js')(services);
const webui = require('./borga-web-ui.js')(services, guest_token);

const express = require('express');
const app = express();

app.set('view engine', 'hbs');

app.use('/favicon.ico', express.static('static-files/favicon.ico'));
app.use('/public', express.static('static-files'));

app.use('/api', webapi);
app.use('/', webui);

app.listen(port);
