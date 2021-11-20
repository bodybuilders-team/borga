'use strict';


const express = require('express');
const errors = require('./borga-errors');


module.exports = function (services) {

    /**
     * Returns json format object containing the cause of the error
     * @param {Object} res 
     * @param {Object} err
     */
    function onError(res, err) {
        switch (err.name) {
            case 'BAD_REQUEST':
                res.status(400);
                break;
            case 'NOT_FOUND':
                res.status(404);
                break;
            case 'ALREADY_EXISTS':
                res.status(409);
                break;
            case 'UNPROCESSABLE_ENTITY':
                res.status(422);
                break;
            case 'EXT_SVC_FAIL':
                res.status(502);
                break;
            default:
                res.status(500);
        }
        res.json({ cause: err });
    }


    /**
     * Checks if a bad request is to be thrown, given parameters and properties.
     * @param {Object} params 
     * @param {Object} properties 
     */
    function checkBadRequest(params, properties) {
        const info = {};

        for (let param in params)        if (!params[param]) info[param] = "parameter missing";
        for (let property in properties) if (!properties[property]) info[property] = "property missing";

        if (Object.keys(info).length != 0) throw errors.BAD_REQUEST(info);
    }


    /**
     * Returns an object containing all popular games from BGA
     * @param {Object} req 
     * @param {Object} res 
     */
    async function getPopularGames(req, res) {
        try {
            const popularGames = await services.getPopularGames();
            res.json({ popularGames });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns a specific game object given its name 
     * @param {Object} req 
     * @param {Object} res 
     */
    async function searchGameByName(req, res) {
        try {
            const gameName = req.params.gameName;

            checkBadRequest({ gameName: gameName });

            const game = await services.searchGameByName(gameName);
            res.json(game);
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns an object containing the new user´s Id.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createNewUser(req, res) {
        try {
            const userId = req.body.userId;
            const userName = req.body.username;

            checkBadRequest({}, { userId: userId, username: userName });

            const addedId = await services.createNewUser(userId, userName);
            res.json({ "Created user": addedId });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns the newly created group object with the specified parameters
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.body.groupName;
            const groupDescription = req.body.groupDescription;

            checkBadRequest({ userId: userId }, { groupName: groupName, groupDescription: groupDescription });

            const group = await services.createGroup(userId, groupName, groupDescription);
            res.json({ "Created group": group });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns the newly edited group name with the specified parameters
     * @param {Object} req 
     * @param {Object} res 
     */
    async function editGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.body.groupName;
            const newGroupName = req.body.newGroupName;
            const newGroupDescription = req.body.newDescription;

            checkBadRequest({ userId: userId }, { name: groupName, newName: newGroupName, newDescription: newGroupDescription });

            const group = await services.editGroup(userId, groupName, newGroupName, newGroupDescription);
            res.json({ "Edited group": group });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns the list of all groups of the specified user
     * @param {Object} req 
     * @param {Object} res 
     */
    async function listGroups(req, res) {
        try {
            const userId = req.params.userId;

            checkBadRequest({ userId: userId }, {});

            const groups = await services.listUserGroups(userId);
            res.json(groups);
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns the newly deleted group name 
     * @param {Object} req 
     * @param {Object} res 
     */
    async function deleteGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.params.groupName;

            checkBadRequest({ userId: userId, groupName: groupName }, {});

            const group = await services.deleteGroup(userId, groupName);
            res.json({ "Deleted group": group });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns an object containing the details of the specified groupName 
     * @param {Object} req 
     * @param {Object} res 
     */
    async function getDetailsOfGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.params.groupName;

            checkBadRequest({ userId: userId, groupName: groupName }, {});

            const group = await services.getGroup(userId, groupName);
            const details = await services.getGroupDetails(group);
            res.json(details);
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns an object containing the name of game added
     * @param {Object} req 
     * @param {Object} res 
     */
    async function addGameToGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.params.groupName;
            const gameName = req.body.gameName;

            checkBadRequest({ userId: userId, groupName: groupName }, { gameName: gameName });

            const game = await services.searchGameByName(gameName);

            await services.addGameToGroup(userId, groupName, game);
            res.json({ "Added game": gameName });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns an object containing the name of game removed
     * @param {Object} req 
     * @param {Object} res 
     */
    async function removeGameFromGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.params.groupName;
            const gameName = req.params.gameName;

            checkBadRequest({ userId: userId, groupName: groupName, gameName: gameName }, {});

            await services.removeGameFromGroup(userId, groupName, gameName);
            res.json({ "Removed game": gameName });
        } catch (err) {
            onError(res, err);
        }
    }


    const router = express.Router();
    router.use(express.json());


    // Get the list of the most popular games
    router.get('/games/popular', getPopularGames);

    // Search games by name
    router.get('/games/search/:gameName', searchGameByName);


    // Create new user
    router.post('/user/create', createNewUser);

    // Create group providing its name and description
    router.post('/user/:userId/myGroups/add', createGroup);

    // Edit group by changing its name and description
    router.post('/user/:userId/myGroups/edit', editGroup);

    // List all groups
    router.get('/user/:userId/myGroups/list', listGroups);

    // Delete a group
    router.delete('/user/:userId/myGroups/:groupName/delete', deleteGroup);

    // Get the details of a group, with its name, description and names of the included games
    router.get('/user/:userId/myGroups/:groupName/details', getDetailsOfGroup);

    // Add a game to a group
    router.put('/user/:userId/myGroups/:groupName/addGame', addGameToGroup);

    // Remove a game from a group
    router.delete('/user/:userId/myGroups/:groupName/removeGame/:gameName', removeGameFromGroup);

    return router;
};

