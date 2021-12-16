'use strict';


const express = require('express');
const async = require('hbs/lib/async');

module.exports = function (services, guest_token) {

    /**
     * Gets the token.
     * @param {Object} req 
     * @returns 
     */
    function getToken(req) {
        return guest_token; // to be improved...
    }


    /**
     * Gets the home page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getHomepage(req, res) {
        res.render('home');
    }


    /**
     * Gets the search page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getSearchPage(req, res) {
        res.render('search');
    }
    

    /**
     * Shows the details of the searched games.
     * @param {Object} req 
     * @param {Object} res 
     */
     async function showSearchedGames(req, res) {
        const header = 'Games';
        const gameName = req.query.gameName;
        try {
            const games = await services.searchGamesByName(gameName);
            res.render('games', { header, gameName, games });
        } catch (err) {
            switch (err.name) {
                case 'BAD_REQUEST':
                    res.status(400).render('games', { header, error: 'no gameName provided' });
                    break;
                case 'NOT_FOUND':
                    res.status(404).render('games', { header, error: `no game found with name ${gameName}` });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('games', { header, error: JSON.stringify(err) });
                    break;
            }
        }
    }


    /**
     * Shows game details.
     * @param {Object} req 
     * @param {Object} res 
     */
     async function showGameDetails(req, res) {
        const header = 'Game Details';
        const gameId = req.params.gameId;
        try {
            const game = await services.getGameDetails(gameId);
            res.render('gameDetails', { header, game });
        } catch (err) {
            switch (err.name) {
                case 'BAD_REQUEST':
                    res.status(400).render('gameDetails', { header, error: 'no gameId provided' });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('gameDetails', { header, error: JSON.stringify(err) });
                    break;
            }
        }
    }


    /**
     * Shows the twenty most popular games.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showPopularGames(req, res) {
        const header = 'Popular Games';
        try {
            const games = Object.values(await services.getPopularGames());
            res.render('games', { header, games });
        } catch (err) {
            console.log(err);
            res.status(500).render('games', { header, error: JSON.stringify(err) });
        }
    }


    /**
     * Shows the user groups.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showUserGroups(req, res) {
        const header = 'Groups';
        const token = getToken(req);
        const userId = req.params.userId;
        try {
            const groups = await services.listUserGroups(token, userId);
            res.render('groups', { header, groups });
        } catch (err) {
            switch (err.name) {
                case 'BAD_REQUEST':
                    res.status(400).render('groups', { header, error: 'no userId provided' });
                    break;
                case 'UNAUTHENTICATED':
                    res.status(401).render('groups', { header, error: 'login required' });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('groups', { header, error: JSON.stringify(err) });
                    break;
            }
        }
    }
    

    /**
     * Shows group details.
     * @param {Object} req 
     * @param {Object} res 
     */
     async function showGroupDetails(req, res) {
        const header = 'Group Details';
        const token = getToken(req);
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        try {
            const group = await services.getGroupDetails(token, userId, groupId);
            res.render('group', { header, group });
        } catch (err) {
            switch (err.name) {
                case 'BAD_REQUEST':
                    res.status(400).render('group', { header, error: 'no userId provided' });
                    break;
                case 'UNAUTHENTICATED':
                    res.status(401).render('group', { header, error: 'login required' });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('group', { header, error: JSON.stringify(err) });
                    break;
            }
        }
    }


    /**
     * Shows the register page.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showRegisterPage(req, res) {
        res.render('register');
    }
    

    const router = express.Router();
    router.use(express.urlencoded({ extended: true }));


    // Homepage
    router.get('/', getHomepage);

    // Search page
    router.get('/search', getSearchPage);

    // Show popular games
    router.get('/popularGames', showPopularGames);

    // Show games searched
    router.get('/games', showSearchedGames);

    // Show game details
    router.get('/games/:gameId', showGameDetails);

    // Show groups
    router.get('/user/:userId/groups', showUserGroups);

    // Show group details
    router.get('/user/:userId/groups/:groupId', showGroupDetails);

    // Register new user
    router.get('/user', showRegisterPage);

    return router;
};
