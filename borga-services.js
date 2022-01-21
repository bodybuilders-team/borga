'use strict';


const errors = require('./borga-errors');
const crypto = require('crypto');


module.exports = function (data_ext, data_int) {

	/**
	 * Validates a request, checking its query parameters and/or body properties, given a schema.
	 * Bad request is thrown when:
	 * - a required parameter or property is missing;
	 * - the type of a property is different from the expected.
	 *
	 * All the information (multiple parameters or properties can fail simultaneously) is thrown in a single json.
	 * @param {Object} schema
	 * @throws BAD_REQUEST if required parameters/properties are missing and/or the types of properties are different from the expected.
	 */
	function checkBadRequest(schema) {
		const info = {};

		if (schema.query) {
			for (const param in schema.query) {
				if (!schema.query[param]) info[param] = "required parameter missing";
			}
		}

		if (schema.body) {
			for (const property in schema.body) {
				const value = schema.body[property].value;
				const type = schema.body[property].type;
				const required = schema.body[property].required;

				if (required && !value) info[property] = "required property missing";
				else if (value && typeof value !== type) info[property] = "wrong type. expected " + type + ". instead got " + typeof value;
			}
		}

		if (Object.keys(info).length > 0) throw errors.BAD_REQUEST(info);
	}


	/**
	 * Checks if both userId and password are associated.
	 * @param {String} userId
	 * @param {String} password
	 * @returns user object
	 * @throws MISSING_PARAM if userId or password are missing
	 * @throws UNAUTHENTICATED if the userId and password are not associated
	 */
	async function checkCredentials(userId, password) {
		if (!userId || !password)
			throw errors.MISSING_PARAM('missing credentials');

		const user = await data_int.getUser(userId);

		if (user.passwordHash !== getHashedPassword(password))
			throw errors.UNAUTHENTICATED({ userId, password });

		return user;
	}


	/**
	 * Receives a password and returns hashed password using sha256 algorithm.
	 * @param {String} password 
	 * @returns hashed password
	 */
	function getHashedPassword(password) {
		return crypto.createHash('sha256').update(password).digest('hex');
	}


	/**
	 * Checks if both token and userId are associated.
	 * @param {String} token
	 * @param {String} userId
	 * @throws UNAUTHENTICATED if the token is invalid
	 */
	async function checkAuthentication(token, userId) {
		if (!token)
			throw errors.UNAUTHENTICATED('Please insert your user token');

		if (userId != await data_int.tokenToUserId(token))
			throw errors.UNAUTHENTICATED('Please insert a valid user token');
	}


	/**
	 * Gets the most popular games.
	 * @returns promise with an array containing the most popular games
	 */
	async function getPopularGames() {
		return await data_ext.getPopularGames();
	}


	/**
	 * Gets an array of games given a name and other optional filter params.
	 * @param {String} gameName
	 * @param {Number} limit
	 * @param {String} order_by
	 * @param {Boolean} ascending
	 * @returns promise with an array of game objects
	 */
	async function searchGamesByName(gameName, limit, order_by, ascending) {
		checkBadRequest({
			query: { gameName }
		});
		return await data_ext.searchGamesByName(gameName, limit, order_by, ascending);
	}


	/**
	 * Creates a new user given its id, name and password.
	 * @param {String} userId 
	 * @param {String} userName 
	 * @param {String} password 
	 * @returns a promise with an object with the new user information
	 */
	async function createNewUser(userId, userName, password) {
		checkBadRequest({
			body: {
				userId: { value: userId, type: 'string', required: true },
				userName: { value: userName, type: 'string', required: true },
				password: { value: password, type: 'string', required: true }
			}
		});

		if (userId != userId.toLowerCase())
			throw errors.BAD_REQUEST({ userId: "User id has to be lowercase!" });

		return await data_int.createNewUser(userId, userName, getHashedPassword(password));
	}


	/**
	 * Adds a new group to the user.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns promise with an object containing the new group information
	 */
	async function createGroup(token, userId, groupName, groupDescription) {
		checkBadRequest({
			body: {
				groupName: { value: groupName, type: 'string', required: true },
				groupDescription: { value: groupDescription, type: 'string', required: true }
			}
		});
		await checkAuthentication(token, userId);

		const groupId = crypto.randomUUID();

		return await data_int.createGroup(userId, groupId, groupName, groupDescription);
	}


	/**
	 * Edits a group by changing its name and description.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupId
	 * @param {String} newGroupName 
	 * @param {String} newGroupDescription 
	 * @returns promise with an object with the edited group information
	 */
	async function editGroup(token, userId, groupId, newGroupName, newGroupDescription) {
		checkBadRequest({
			body: {
				newGroupName: { value: newGroupName, type: 'string', required: false },
				newGroupDescription: { value: newGroupDescription, type: 'string', required: false }
			}
		});
		await checkAuthentication(token, userId);

		return await data_int.editGroup(userId, groupId, newGroupName, newGroupDescription);
	}


	/**
	 * Lists all existing user groups.
	 * @param {String} token 
	 * @param {String} userId
	 * @returns promise with object containing all group objects
	 */
	async function listUserGroups(token, userId) {
		await checkAuthentication(token, userId);

		return await data_int.listUserGroups(userId);
	}


	/**
	 * Deletes the group with the given groupId.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupId 
	 * @returns promise with an object with the deleted group information
	 */
	async function deleteGroup(token, userId, groupId) {
		await checkAuthentication(token, userId);

		return await data_int.deleteGroup(userId, groupId);
	}


	/**
	 * Gets an object containing the group details.
	 * @param {String} token
	 * @param {String} userId
	 * @param {String} groupId
	 * @returns promise an object containing the group details
	 */
	async function getGroupDetails(token, userId, groupId) {
		await checkAuthentication(token, userId);

		return await data_int.getGroupDetails(userId, groupId);
	}


	/**
	 * Gets an object containing the game details.
	 * @param {String} gameId
	 * @returns promise an object containing the game details
	 */
	async function getGameDetails(gameId) {
		return await data_ext.searchGamesById(gameId);
	}


	/**
	 * Adds a new game to a group.
	 * @param {String} token
	 * @param {String} userId
	 * @param {String} groupId 
	 * @param {String} gameId
	 * @return a promise with the added game object
	 */
	async function addGameToGroup(token, userId, groupId, gameId) {
		await checkAuthentication(token, userId);

		const game = await data_ext.searchGamesById(gameId);

		return await data_int.addGameToGroup(userId, groupId, game);
	}


	/**
	 * Removes a game from a group given its name.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupId 
	 * @param {String} gameId
	 * @return promise with the removed game object
	 */
	async function removeGameFromGroup(token, userId, groupId, gameId) {
		await checkAuthentication(token, userId);

		return await data_int.removeGameFromGroup(userId, groupId, gameId);
	}


	/**
	 * Gets an user by its id
	 * @param {String} userId 
	 * @returns the user object
	 */
	async function getUser(userId) {
		return await data_int.getUser(userId);
	}

	/**
	 * Gets one token associated with userId.
	 * @param {String} userId 
	 * @returns the token
	 */
	async function getToken(userId) {
		return await data_int.getToken(userId);
	}


	return {
		getPopularGames,
		searchGamesByName,

		createNewUser,
		getUser,
		getToken,
		createGroup,
		editGroup,
		listUserGroups,
		deleteGroup,
		getGroupDetails,
		getGameDetails,
		addGameToGroup,
		removeGameFromGroup,

		checkCredentials
	};
};
