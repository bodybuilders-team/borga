'use strict';


const errors = require('../borga-errors.js');

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
    "Skyrim": {
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
    searchGamesByName,
    searchGamesById
};
