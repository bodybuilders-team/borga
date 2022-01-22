'use strict';


const default_port = process.env['PORT'];
const port = process.argv[2] || default_port;

const config = require('./borga-config');

const es_spec = {
	url: config.es_url,
	prefix: 'prod'
};

// When true, uses the borga-data-db module, otherwise uses the borga-data-mem
const USE_DATA_DB = false; 

const server = require('./borga-server');
const app = server(es_spec, config.guest, USE_DATA_DB);

app.listen(port);
