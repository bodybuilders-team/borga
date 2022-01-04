'use strict';


module.exports = function (es_spec, guest) {

	const data_ext_games = require('./board-games-data.js');
	//const data_int = require('./borga-data-mem.js')(guest);
	const data_int =
		require('./borga-data-db')(
			es_spec.url,
			es_spec.prefix
		);

	const services = require('./borga-services.js')(data_ext_games, data_int);

	const web_api = require('./borga-web-api.js')(services);
	const web_site = require('./borga-web-site.js')(services, guest);

	const express = require('express');
	const app = express();

	app.set('view engine', 'hbs');

	app.use('/favicon.ico', express.static('static-files/favicon.ico'));
	app.use('/public', express.static('static-files'));

	app.use('/api', web_api);
	app.use('/', web_site);

	return app;
};
