'use strict';


const express = require('express');

module.exports = function (services) {

    function getHomepage(req, res) {
        res.render('home');
    }

    function getSearchPage(req, res) {
        res.render('search');
    }

    async function showGameDetails(req, res) {
        const header = 'Game Details';
        const gameName = req.query.gameName;
        try {
            const gameRes = await services.searchGamesByName(gameName);
            const game = gameRes[1]; // Implement to Multiple games
            res.render('game', { header, game });
        } catch (err) {
            switch (err.name) {
                case 'BAD_REQUEST':
                    res.status(400).render('game', { header, error: 'no gameName provided' });
                    break;
                case 'NOT_FOUND':
                    res.status(404).render('game', { header, error: `no game found with name ${gameName}` });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('game', { header, error: JSON.stringify(err) });
                    break;
            }
        }
    }

    const router = express.Router();
    router.use(express.urlencoded({ extended: true }));

    // Homepage
    router.get('/', getHomepage);

    // Search page
    router.get('/search', getSearchPage);

    // List user groups

    // Show game
    router.get('/game', showGameDetails);

    return router;
};