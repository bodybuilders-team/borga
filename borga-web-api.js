'use strict';


const express = require('express');
const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-api-spec.json');
const errors = require('./borga-errors');


module.exports = function (services) {

	/**
	 * Searches for an identification Bearer token in the request's Authorization Header
	 * @param {Object} req 
	 * @returns the token found if it´s a Bearer Token. 
	 */
	function getBearerToken(req) {
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0,6).toLowerCase() === 'bearer') {
				return authData.replace(/^bearer\s+/i, '');
			}
		}
		return null;
	}


	/**
	 * Sends as response an object containing the cause of the error
	 * @param {Object} res 
	 * @param {Object} err
	 */
	function onError(res, err) {
		switch (err.name) {
			case 'BAD_REQUEST':
				res.status(400);
				break;
			case 'UNAUTHENTICATED':
				res.status(401);
			break;
			case 'NOT_FOUND':
				res.status(404);
				break;
			case 'ALREADY_EXISTS':
				res.status(409);
				break;
			case 'EXT_SVC_FAIL':
				res.status(502);
				break;
			default:
				console.log(err)
				res.status(500);
		}
		res.json({ cause: err });
	}


	/**
	 * Sends as response an object containing the most popular games among all users
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
	 * Sends as response a specific game object given its name
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function searchGameByName(req, res) {
		try {
			const gameName = req.params.gameName;

			const game = await services.searchGameByName(gameName);
			res.json(game);
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Creates a new user. In case of success, sends as response an object with the new user's information
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function createNewUser(req, res) {
		try {
			const userId = req.body.userId;
			const username = req.body.username;

			const userInfo = await services.createNewUser(userId, username);
			res.json({ "Created user": userInfo });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Creates a new group. In case of success, sends as response an object with the name of the created group
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function createGroup(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)
			const groupName = req.body.groupName;
			const groupDescription = req.body.groupDescription;

			const name = await services.createGroup(userId, token, groupName, groupDescription);
			res.json({ "Created group": name });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Edits a group with the specified parameters. In case of success, sends as response an object with the new name of the edited group
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function editGroup(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)
			const groupName = req.body.groupName;
			const newGroupName = req.body.newGroupName;
			const newGroupDescription = req.body.newGroupDescription;

			const name = await services.editGroup(userId, token, groupName, newGroupName, newGroupDescription);
			res.json({ "Edited group": name });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Sends as response the list of all groups of the specified user.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function listGroups(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)

			const groups = await services.listUserGroups(userId, token);
			res.json(groups);
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Deletes a group. In case of success, sends as response an object with the name of the deleted group
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function deleteGroup(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)
			const groupName = req.params.groupName;

			const name = await services.deleteGroup(userId, token, groupName);
			res.json({ "Deleted group": name });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Sends as response an object containing the details of the specified group 
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function getDetailsOfGroup(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)
			const groupName = req.params.groupName;	

			const details = await services.getGroupDetails(userId, token, groupName);
			res.json(details);
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Adds a game to a group. In case of success, sends as response an object with the name of added game
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function addGameToGroup(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)
			const groupName = req.params.groupName;
			const gameName = req.body.gameName;

			const name = await services.addGameToGroup(userId, token, groupName, gameName);
			res.json({ "Added game": name });
		} catch (err) {
			onError(res, err);
		}
	}


	/**
	 * Removes a game from a group. In case of success, sends as response an object with the name of the removed game
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function removeGameFromGroup(req, res) {
		try {
			const userId = req.params.userId;
			const token = getBearerToken(req)
			const groupName = req.params.groupName;
			const gameName = req.params.gameName;

			const name = await services.removeGameFromGroup(userId, token, groupName, gameName);
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
