'use strict';


const default_port = 8888;
const port = process.argv[2] || default_port;

const es_host = 'localhost';
const es_port = 9200;

const es_prefix = 'prod';

const guest_user = 'guest'
const guest_token = '6df9657a-e012-4fbd-9193-af5fe832bcf6';

const data_ext_games = require('./board-games-data.js');
//const data_int = require('./borga-data-mem.js');
const data_int =
	require('./borga-data-db')(
		es_host, es_port,
		es_prefix
	)

const services = require('./borga-services.js')(data_ext_games, data_int);

const webapi = require('./borga-web-api.js')(services);
const webui = require('./borga-web-site.js')(services, guest_token);

const express = require('express');
const app = express();

app.set('view engine', 'hbs');

app.use('/favicon.ico', express.static('static-files/favicon.ico'));
app.use('/public', express.static('static-files'));

app.use('/api', webapi);
app.use('/', webui);

app.listen(port);
