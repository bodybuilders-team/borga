'use strict';


const express = require('express');
const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-api-spec.json');
const errors = require('./borga-errors');


module.exports = function (services) {

    /**
     * Returns json format object containing the cause of the error.
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
     * Bad request is thrown when:
     * - a needed parameter/property is missing;
     * - the type of a property (from body's json) is different from the expected.
     * 
     * All the information (multiple parameters/properties can fail simultaneously) is thrown in a single json.
     * @param {Object} params 
     * @param {Object} properties 
     * @throws BAD_REQUEST if needed parameters/properties are missing and/or the types of properties are different from the expected
     */
    function checkBadRequest(params, properties) {
        const info = {};

        for (let param in params) {
            const value = params[param].value;

            if (!value) info[param] = "parameter missing";
        }
        for (let property in properties) {
            const value = properties[property].value;
            const type = properties[property].type;

            if (!value) info[property] = "property missing";
            else if (typeof value !== type) info[property] = "wrong type. expected " + type + ". instead got " + typeof value;
        }

        if (Object.keys(info).length != 0) throw errors.BAD_REQUEST(info);
    }


    /**
     * Returns an object containing the most popular games among all users.
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
     * Returns a specific game object given its name.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function searchGameByName(req, res) {
        try {
            const gameName = req.params.gameName;

            checkBadRequest({
                gameName: { value: gameName }
            }, {});

            const game = await services.searchGameByName(gameName);
            res.json(game);
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Creates a new user. In case of success, returns an object containing the new user´s Id.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createNewUser(req, res) {
        try {
            const userId = req.body.userId;
            const username = req.body.username;

            checkBadRequest({}, {
                userId: { value: userId, type: 'string' },
                username: { value: username, type: 'string' }
            });

            const addedId = await services.createNewUser(userId, username);
            res.json({ "Created user": addedId });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Creates a new group. In case of success, returns the newly created group object with the specified parameters.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.body.groupName;
            const groupDescription = req.body.groupDescription;

            checkBadRequest({
                userId: { value: userId }
            }, {
                groupName: { value: groupName, type: 'string' },
                groupDescription: { value: groupDescription, type: 'string' }
            });

            const name = await services.createGroup(userId, groupName, groupDescription);
            res.json({ "Created group": name });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Edits a group with the specified parameters. In case of success, returns an object with the newly edited group.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function editGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.body.groupName;
            const newGroupName = req.body.newGroupName;
            const newGroupDescription = req.body.newGroupDescription;

            checkBadRequest({
                userId: { value: userId }
            }, {
                groupName: { value: groupName, type: 'string' },
                newGroupName: { value: newGroupName, type: 'string' },
                newGroupDescription: { value: newGroupDescription, type: 'string' }
            });

            const name = await services.editGroup(userId, groupName, newGroupName, newGroupDescription);
            res.json({ "Edited group": name });
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Returns the list of all groups of the specified user.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function listGroups(req, res) {
        try {
            const userId = req.params.userId;

            checkBadRequest({
                userId: { value: userId }
            }, {});

            const groups = await services.listUserGroups(userId);
            res.json(groups);
        } catch (err) {
            onError(res, err);
        }
    }


    /**
     * Deltes a group. In case of success, returns the newly deleted group name.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function deleteGroup(req, res) {
        try {
            const userId = req.params.userId;
            const groupName = req.params.groupName;

            checkBadRequest({
                userId: { value: userId },
                groupName: { value: groupName }
            }, {});

            const name = await services.deleteGroup(userId, groupName);
            res.json({ "Deleted group": name });
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

            checkBadRequest({
                userId: { value: userId },
                groupName: { value: groupName }
            }, {});

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

            checkBadRequest({
                userId: { value: userId },
                groupName: { value: groupName }
            }, {
                gameName: { value: gameName, type: 'string' }
            });

            const game = await services.searchGameByName(gameName);

            const name = await services.addGameToGroup(userId, groupName, game);
            res.json({ "Added game": name });
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

            checkBadRequest({
                userId: { value: userId },
                groupName: { value: groupName },
                gameName: { value: gameName }
            }, {});

            const name = await services.removeGameFromGroup(userId, groupName, gameName);
            res.json({ "Removed game": name });
        } catch (err) {
            onError(res, err);
        }
    }


    const router = express.Router();
    router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));
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

    router.use(function (req, res, next) {
        res.status(404).send(errors.NOT_FOUND("Cannot find " + req.path))
    });

    return router;
};
