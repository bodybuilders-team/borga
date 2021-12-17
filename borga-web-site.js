'use strict';


const express = require('express');
const async = require('hbs/lib/async');
const crypto = require('crypto');


module.exports = function (services, guest_token) {

    /**
     * Gets the token.
     * @param {Object} req 
     * @returns the token from the request
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
     * Shows game details.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showGameDetails(req, res) {
        const gameId = req.params.gameId;
        try {
            const game = await services.getGameDetails(gameId);
            const groups = Object.values(await services.listUserGroups(getToken(req), "guestId")); // To be improved
            res.render('gameDetails', { header: 'Game Details', game, groups });
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Shows the twenty most popular games.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showPopularGames(req, res) {
        try {
            const games = Object.values(await services.getPopularGames());
            res.render('games', { header: 'Popular Games', games });
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Shows the details of the searched games.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showSearchedGames(req, res) {
        const gameName = req.query.gameName;
        try {
            const games = await services.searchGamesByName(gameName);
            const groups = Object.values(await services.listUserGroups(getToken(req), "guestId")); // To be improved
            res.render('games', { header: 'Games', gameName, games, groups });
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Shows the user groups.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showUserGroups(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        try {
            const groups = await services.listUserGroups(token, userId);
            res.render('groups', { groups });
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Shows group details.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showGroupDetails(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        try {
            const group = await services.getGroupDetails(token, userId, groupId);
            group.id = groupId;
            // TODO - mandar game com url para poder meter hiperligação
            res.render('groupDetails', { header: 'Group Details', group });
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Creates a group.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createGroup(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        const groupName = req.body.groupName;
        const groupDescription = req.body.groupDescription;
        const groupId = crypto.randomUUID();

        try {
            await services.createGroup(token, userId, groupId, groupName, groupDescription);
            res.redirect(`/user/${userId}/groups/${groupId}`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Edits a group.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function editGroup(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        const newGroupName = req.body.newGroupName;
        const newGroupDescription = req.body.newGroupDescription;

        try {
            await services.editGroup(token, userId, groupId, newGroupName, newGroupDescription);
            res.redirect(`/user/${userId}/groups/${groupId}`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Deletes a group.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function deleteGroup(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        const groupId = req.params.groupId;

        try {
            await services.deleteGroup(token, userId, groupId);
            res.redirect(`/user/${userId}/groups`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Adds a game to a group.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function addGameToGroup(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        const gameId = req.params.gameId;

        try {
            await services.addGameToGroup(token, userId, groupId, gameId);
            res.redirect(`/user/${userId}/groups/${groupId}`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    /**
     * Removes a game from a group.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function removeGameFromGroup(req, res) {
        const token = getToken(req);
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        const gameId = req.params.gameId;

        try {
            await services.removeGameFromGroup(token, userId, groupId, gameId);
            res.redirect(`/user/${userId}/groups/${groupId}`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }


    // NOT YET IMPLEMENTED
    /**
     * Shows the register page.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function showUserPage(req, res) {
        const userId = req.params.userId;
        //const user = await services.getUser(userId);

        res.render('user');//, { user } );
    }

    // NOT YET IMPLEMENTED
    /**
     * Register new user
     * @param {Object} req 
     * @param {Object} res 
     */
    async function registerUser(req, res) {
        const userName = req.body.userName;
        const userId = req.body.userId;
        const password = req.body.password;

        try {
            const userInfo = await services.createNewUser(userId, userName);
            res.redirect('/user');
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
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


    // Show register/login - NOT YET IMPLEMENTED
    router.get('/user', showUserPage);

    // Show user page - NOT YET IMPLEMENTED
    router.get('/user/:userId', showUserPage);

    // Register new user - NOT YET IMPLEMENTED
    router.post('/user', registerUser);


    // Show groups
    router.get('/user/:userId/groups', showUserGroups);

    // Create group
    router.post('/user/:userId/groups', createGroup);

    // Show group details
    router.get('/user/:userId/groups/:groupId', showGroupDetails);

    // Show group details
    router.post('/user/:userId/groups/:groupId', editGroup);

    // Deletes a group -> To be replaced
    router.post('/user/:userId/groups/:groupId/delete', deleteGroup);


    // Adds a game to a group
    router.post('/user/:userId/groups/:groupId/games/:gameId', addGameToGroup);

    // Removes a game from a group -> To be replaced
    router.post('/user/:userId/groups/:groupId/games/:gameId/remove', removeGameFromGroup);

    return router;
};
