'use strict';


require('dotenv').config();

const errors = require('./borga-errors');
const fetch = require('node-fetch');

const BOARD_GAME_ATLAS_BASE_URI = 'https://api.boardgameatlas.com/api/search?' + 'client_id=' + process.env['ATLAS_CLIENT_ID'];
const HTTP_SERVER_ERROR = 5;
const HTTP_CLIENT_ERROR = 4;


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
	const res = await fetch(uri).catch(err => { throw errors.EXT_SVC_FAIL(err); })
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
						throw errors.FAIL(info)
				}
			});
	}
}



/**
 * Builds an object containing the game information.
 * @param {Object} gameInfo 
 * @returns object with game information
 */
function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		url: gameInfo.url,
		image: gameInfo.image_url,
		publisher: gameInfo.publisher,
		amazon_rank: gameInfo.amazon_rank,
		price: gameInfo.price
	};
}


/**
 * Gets a list of games by a given name.
 * @param {String} gameName
 * @throws error NOT_FOUND if no game was found with the given name
 * @returns promise with a list of game objects
 */
async function searchGamesByName(gameName) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + '&name=' + gameName;

	const res = await do_fetch(game_uri);

	if (res.games.length == 0 || res.count == 0)
		throw errors.NOT_FOUND({ name: gameName });

	return Object.values(res.games.map(game => makeGameObj(game)));
}



/**
 * Gets a game by a given id.
 * @param {String} gameId
 * @throws error NOT_FOUND if no game was found with the given id
 * @returns promise with the game object
 */
 async function searchGamesById(gameId) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + '&ids=' + gameId;

	const res = await do_fetch(game_uri);

	if (res.games.length == 0 || res.count == 0)
		throw errors.NOT_FOUND({ gameId: gameId });

	return makeGameObj(res.games[0]);
}


module.exports = {
	searchGamesByName,
	searchGamesById,
	getStatusClass,
	makeGameObj,
	do_fetch
};
