'use strict';


require('dotenv').config();

const errors = require('./borga-errors');
const fetch = require('node-fetch');

const BOARD_GAME_ATLAS_BASE_URI = 'https://api.boardgameatlas.com/api/search?' + 'client_id=' + process.env['ATLAS_CLIENT_ID'];
const BOARD_GAME_ATLAS_MECHANICS_URI = 'https://api.boardgameatlas.com/api/game/mechanics?client_id=' + process.env['ATLAS_CLIENT_ID'];
const BOARD_GAME_ATLAS_CATEGORIES_URI = 'https://api.boardgameatlas.com/api/game/categories?client_id=' + process.env['ATLAS_CLIENT_ID'];

const HTTP_SERVER_ERROR = 5;
const HTTP_CLIENT_ERROR = 4;

const mechanics = {};
const categories = {};


/**
 * Gets the id:name map for mechanics and categories from Board Game Atlas.
 */
(async function () {
	const mechanicsRes = await do_fetch(BOARD_GAME_ATLAS_MECHANICS_URI);
	for (const i in mechanicsRes.mechanics) {
		const mechanic = mechanicsRes.mechanics[i];
		mechanics[mechanic.id] = mechanic.name;
	}

	const categoriesRes = await do_fetch(BOARD_GAME_ATLAS_CATEGORIES_URI);
	for (const i in categoriesRes.categories) {
		const category = categoriesRes.categories[i];
		categories[category.id] = category.name;
	}
})();


/**
 * Gets the status class from the received status code.
 * @param {Number} statusCode 
 * @returns status class
 */
function getStatusClass(statusCode) {
	return ~~(statusCode / 100);
}


/**
 * Does a fetch request to the specified uri.
 * @param {String} uri 
 * @throws EXT_SVC_FAIL if there was an external server side error
 * @throws NOT_FOUND if the solicited resource wasn't found (client error)
 * @throws FAIL if there was some other error
 * @returns promise with a json response
 */
async function do_fetch(uri) {
	const res = await fetch(uri).catch(err => { throw errors.EXT_SVC_FAIL(err); });
	if (res.ok)
		return res.json();

	else {
		return res.json()
			.catch(err => err)
			.then(info => {
				switch (getStatusClass(res.status)) {
					case HTTP_SERVER_ERROR:
						throw errors.EXT_SVC_FAIL(info);
					case HTTP_CLIENT_ERROR:
						throw errors.NOT_FOUND(uri);
					default:
						throw errors.FAIL(info);
				}
			});
	}
}


/**
 * Builds an object containing the game information.
 * @param {Object} gameInfo 
 * @returns object with game information
 */
async function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		description: gameInfo.description.replace(/<\/?p>/ig, '\n'),
		url: gameInfo.url,
		image_url: gameInfo.image_url,
		publisher: gameInfo.publisher,
		amazon_rank: gameInfo.amazon_rank,
		price: gameInfo.price,
		mechanics: await getGameMechanics(gameInfo),
		categories: await getGameCategories(gameInfo)
	};
}


/**
 * Gets the name for each mechanic of the given game.
 * @param {Object} game 
 * @returns array with mechanic names
 */
async function getGameMechanics(game) {
	return game.mechanics.map(mechanic => mechanics[mechanic.id]);
}


/**
 * Gets the name for each category of the given game.
 * @param {Object} game 
 * @returns array with categories names
 */
 async function getGameCategories(game) {
	return game.categories.map(category => categories[category.id]);
}


/**
 * Gets an array of games by a given name and other optional filter params.
 * @param {String} gameName
 * @param {Number} limit
 * @param {String} order_by
 * @param {Boolean} ascending
 * @throws error NOT_FOUND if no game was found with the given query
 * @returns promise with an array of game objects
 */
async function searchGamesByName(gameName, limit, order_by, ascending) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + `&name=${gameName}&limit=${limit}&order_by=${order_by}&ascending=${ascending}`;

	const res = await do_fetch(game_uri);

	if (res.games.length == 0 || res.count == 0)
		throw errors.NOT_FOUND({ name: gameName });

	return Promise.all(Object.values(res.games.map(async (game) => await makeGameObj(game))));
}


/**
 * Gets a game given an id.
 * @param {String} gameId
 * @throws error NOT_FOUND if no game was found with the given id
 * @returns promise with the game object
 */
async function searchGamesById(gameId) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + `&ids=${gameId}`;

	const res = await do_fetch(game_uri);

	if (res.games.length == 0 || res.count == 0)
		throw errors.NOT_FOUND({ gameId: gameId });

	return await makeGameObj(res.games[0]);
}


module.exports = {
	searchGamesByName,
	searchGamesById,
	getStatusClass,
	makeGameObj,
	do_fetch
};
