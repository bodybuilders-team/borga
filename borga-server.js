'use strict';


const express = require('express');
const session = require('express-session');
const passport = require('passport');

passport.serializeUser((userInfo, done) => { done(null, userInfo); });
passport.deserializeUser((userInfo, done) => { done(null, userInfo); });

module.exports = function (es_spec, guest, use_data_db) {

	const data_ext_games = require('./board-games-data.js');
	const data_int = require('./borga-data-mem.js')(guest);
	const data_db =
		require('./borga-data-db')(
			es_spec.url,
			es_spec.prefix
		);


	const services = require('./borga-services.js')(data_ext_games, use_data_db ? data_db : data_int);

	const web_api = require('./borga-web-api.js')(services);
	const web_site = require('./borga-web-site.js')(services);

	const app = express();
	app.use(session({
		secret: 'isel-ipw-borga',
		resave: false,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());

	app.set('view engine', 'hbs');

	app.use('/favicon.ico', express.static('static-files/favicon.ico'));
	app.use('/public', express.static('static-files'));

	app.use('/api', web_api);
	app.use('/', web_site);

	return app;
};
