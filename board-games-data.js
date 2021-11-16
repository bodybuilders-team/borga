'use strict';

module.exports = {
	findGame,
	getGameByName
};

require('dotenv').config();

const errors = require('./borga-errors');
const fetch = require('node-fetch');

// FY6IrZTDRe
const BOARD_GAME_ATLAS_BASE_URI = 'https://api.boardgameatlas.com/api/search?' + 'client_id=' + process.env['ATLAS_CLIENT_ID'];
const HTTP_SERVER_ERROR = 5;


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
 * @returns promise with a json response
 */
async function do_fetch(uri) {
	const res = await fetch(uri).catch(err => { throw errors.EXT_SVC_FAIL(err); })
	if (res.ok)
		return res.json();

	else {
		return res.json()
			.catch(err => err) // can you see what this does?
			.then(info => {
				throw (getStatusClass(res.status) === HTTP_SERVER_ERROR) ? errors.EXT_SVC_FAIL(info) : errors.FAIL(info);
			});
	}
}



/**
 * Builds an object containing the game information
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
 * Gets a game object given a query
 * @param {String} query 
 * @returns promise with the game object response
 */
async function findGame(query) {
	const search_uri = BOARD_GAME_ATLAS_BASE_URI + '?q=' + query;

	const answer = await do_fetch(search_uri);
	if (answer.items && answer.items.length)
		return makeGameObj(answer.items[0]);
	else
		throw errors.NOT_FOUND({ query });
}


/**
 * Gets a game by its name
 * @param {String} name 
 * @returns promise with the game object response
 */
async function getGameByName(name) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + '&name=' + name;

	const res = await do_fetch(game_uri);
	return makeGameObj(res.games[0]);
}

(async () => {
	try {
		const game = await getGameByName("Catan");
		console.log(game);
	}
	catch (err) { console.log(err) };
})();
