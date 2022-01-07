'use strict';


const errors = require('../../../borga-errors.js');


const games = {
	"I9azM1kA6l": {
		id: "I9azM1kA6l",
		name: "Skyrim",
		url: "games.net/skyrim",
		image: "skyrim.jpg",
		publisher: "Bethesda Game Studios",
		amazon_rank: 1,
		price: '420.69'
	},
	"OIXt3DmJU0": {
		id: 'OIXt3DmJU0',
		name: 'Catan',
		url: 'https://www.boardgameatlas.com/game/OIXt3DmJU0/catan',
		image: 'https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1629324722072.jpg',
		publisher: 'KOSMOS',
		amazon_rank: 133,
		price: '22.00'
	}
}

const requests = {
	"Monopoly Skyrim": {
		"games": [
			{
				id: "I9azM1kA6l",
				name: "Skyrim",
				url: "games.net/skyrim",
				image: "skyrim.jpg",
				publisher: "Bethesda Game Studios",
				amazon_rank: 1,
				price: '420.69'
			}
		],
		"count": 1
	},
	"Catan": {
		"games": [
			{
				id: 'OIXt3DmJU0',
				name: 'Catan',
				url: 'https://www.boardgameatlas.com/game/OIXt3DmJU0/catan',
				image: 'https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1629324722072.jpg',
				publisher: 'KOSMOS',
				amazon_rank: 133,
				price: '22.00'
			}
		],
		"count": 1
	}
}


/**
 * Gets the most popular games by ranking.
 * @returns promise with an array containing the most popular games
 */
async function getPopularGames() {
	return [
		{ id: "TAAifFP590", name: "Root" },
		{ id: "yqR4PtpO8X", name: "Scythe" },
		{ id: "5H5JS0KLzK", name: "Wingspan" },
		{ id: "RLlDWHh7hR", name: "Gloomhaven" },
		{ id: "fDn9rQjH9O", name: "Terraforming Mars" },
		{ id: "i5Oqu5VZgP", name: "Azul" },
		{ id: "7NYbgH2Z2I", name: "Viticulture: Essential Edition" },
		{ id: "6FmFeux5xH", name: "Pandemic" },
		{ id: "kPDxpJZ8PD", name: "Spirit Island" },
		{ id: "j8LdPFmePE", name: "7 Wonders Duel" },
		{ id: "OF145SrX44", name: "7 Wonders" },
		{ id: "GP7Y2xOUzj", name: "Codenames" },
		{ id: "VNBC6yq1WO", name: "The Castles of Burgundy" },
		{ id: "oGVgRSAKwX", name: "Carcassonne" },
		{ id: "O0G8z5Wgz1", name: "Splendor" },
		{ id: "mce5HZPnF5", name: "Pandemic Legacy: Season 1" },
		{ id: "FCuXPSfhDR", name: "Concordia" },
		{ id: "8xos44jY7Q", name: "Everdell" },
		{ id: "AuBvbISHR6", name: "Ticket to Ride" },
		{ id: "3IPVIROfvl", name: "Brass: Birmingham" }
	];
}


/**
 * Gets a list of games by a given name.
 * @param {String} gameName
 * @throws error NOT_FOUND if no game was found with the given name
 * @returns promise with a list of game objects
 */
async function searchGamesByName(gameName) {
	const res = requests[gameName];
	if (!res || res.games.length == 0 || res.count == 0) {
		throw errors.NOT_FOUND({ gameName })
	}
	return res.games;
}


/**
 * Gets a game by a given id.
 * @param {String} gameId
 * @throws error NOT_FOUND if no game was found with the given id
 * @returns promise with the game object
 */
async function searchGamesById(gameId) {
	const game = games[gameId];
	if (!game) {
		throw errors.NOT_FOUND({ gameId })
	}
	return game;
}


module.exports = {
	games,
	getPopularGames,
	searchGamesByName,
	searchGamesById
};
