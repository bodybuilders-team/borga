'use strict';


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
};


const requests = {
    "Catan": "OIXt3DmJU0",
    "Skyrim": "I9azM1kA6l",
};


async function searchGamesByName(gameName) {
    const gameId = requests[gameName];
    if(!gameId){
        throw errors.NOT_FOUND({ gameName })
    }
    return games[gameId];
}


module.exports = {
    games,
    searchGamesByName
};
