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
     * Shows the game details.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showGameDetails(req, res) {
        const header = 'Game Details';
        const gameName = req.query.gameName;
        try {
            const games = await services.searchGamesByName(gameName);
            res.render('game', { header, gameName, games });
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


    /**
     * Shows the user groups
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showUserGroups(req, res) {
        const header = 'Groups';
        const token = getToken(req);
        const userId = req.params.userId;
        try {
            const userGroups = await services.listUserGroups(token, userId);
            res.render('groups', { header, userGroups });
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

    const router = express.Router();
    router.use(express.urlencoded({ extended: true }));

    // Homepage
    router.get('/', getHomepage);

    // Search page
    router.get('/search', getSearchPage);

    // Show game
    router.get('/game', showGameDetails);

    // Show groups
    router.get('/user/:userId/groups', showUserGroups);

    return router;
};
