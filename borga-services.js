'use strict';


const errors = require('./borga-errors');


module.exports = function (data_ext, data_int) {

	/**
	 * Checks if a bad request is to be thrown, given properties (from body's json).
	 * Bad request is thrown when:
	 * - a needed property is missing;
	 * - the type of a property is different from the expected.
	 * 
	 * All the information (multiple properties can fail simultaneously) is thrown in a single json.
	 * @param {Object} properties 
	 * @throws BAD_REQUEST if needed parameters/properties are missing and/or the types of properties are different from the expected
	 */
	function checkBadRequest(properties) {
		const info = {};

		for (let property in properties) {
			const value = properties[property].value;
			const type = properties[property].type;

			if (!value) info[property] = "property missing";
			else if (typeof value !== type) info[property] = "wrong type. expected " + type + ". instead got " + typeof value;
		}

		if (Object.keys(info).length > 0) throw errors.BAD_REQUEST(info);
	}


	/**
	 * Checks if token and userId are associated.
	 * @param {String} token
	 * @param {String} userId
	 * @throws UNAUTHENTICATED if the token is invalid
	 */
	function checkAuthentication(token, userId) {
		if (!token)
			throw errors.UNAUTHENTICATED('Please insert your user token');

		if (userId != data_int.tokenToUserId(token))
			throw errors.UNAUTHENTICATED('Please insert a valid user token');
	}


	/**
	 * Gets the most popular games.
	 * @returns a promise with an object containing the ids and names of the twenty most popular games
	 */
	async function getPopularGames() {
		return await data_int.getPopularGames();
	}


	/**
	 * Gets an array of games by a given name.
	 * @param {String} gameName
	 * @returns promise with an array of game objects
	 */
	async function searchGamesByName(gameName) {
		return await data_ext.searchGamesByName(gameName);
	}


	/**
	 * Creates a new user by its id and name.
	 * @param {String} userId 
	 * @param {String} userName 
	 * @returns a promise with an object with the new user information
	 */
	async function createNewUser(userId, userName) {
		checkBadRequest({
			userId: { value: userId, type: 'string' },
			userName: { value: userName, type: 'string' }
		});

		return await data_int.createNewUser(userId, userName);
	}


	/**
	 * Creates a new group of the user.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupId
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns promise with an object with the new group information
	 */
	async function createGroup(token, userId, groupId, groupName, groupDescription) {
		checkBadRequest({
			groupId: { value: groupId, type: 'string' },
			groupName: { value: groupName, type: 'string' },
			groupDescription: { value: groupDescription, type: 'string' }
		});
		checkAuthentication(token, userId);

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
			newGroupName: { value: newGroupName, type: 'string' },
			newGroupDescription: { value: newGroupDescription, type: 'string' }
		});
		checkAuthentication(token, userId);

		return await data_int.editGroup(userId, groupId, newGroupName, newGroupDescription);
	}


	/**
	 * List all existing groups inside the user.
	 * @param {String} token 
	 * @param {String} userId
	 * @returns promise with object containing all group objects
	 */
	async function listUserGroups(token, userId) {
		checkAuthentication(token, userId);

		return await data_int.listUserGroups(userId);
	}


	/**
	 * Deletes the group of the specified groupId.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupId 
	 * @returns promise with an object with the deleted group information
	 */
	async function deleteGroup(token, userId, groupId) {
		checkAuthentication(token, userId);

		return await data_int.deleteGroup(userId, groupId);
	}


	/**
	 * Gets the an object containing the group details.
	 * @param {String} token
	 * @param {String} userId
	 * @param {Object} groupId
	 * @returns promise an object containing the group details
	 */
	async function getGroupDetails(token, userId, groupId) {
		checkAuthentication(token, userId);

		const group = await data_int.getGroupFromUser(userId, groupId);

		return await data_int.getGroupDetails(group);
	}


	/**
	 * Adds a new game to a group.
	 * @param {String} token
	 * @param {String} userId
	 * @param {String} groupId 
	 * @param {Object} gameId
	 * @return promise with the added gameo object
	 */
	async function addGameToGroup(token, userId, groupId, gameId) {
		checkAuthentication(token, userId);

		const game = await data_ext.searchGamesById(gameId);

		return await data_int.addGameToGroup(userId, groupId, game);
	}


	/**
	 * Removes a game from a group providing its name.
	 * @param {String} token 
	 * @param {String} userId
	 * @param {String} groupId 
	 * @param {String} gameId
	 * @return promise with the removed game object
	 */
	async function removeGameFromGroup(token, userId, groupId, gameId) {
		checkAuthentication(token, userId);

		return await data_int.removeGameFromGroup(userId, groupId, gameId);
	}


	return {
		getPopularGames,
		searchGamesByName,

		createNewUser,
		createGroup,
		editGroup,
		listUserGroups,
		deleteGroup,
		getGroupDetails,
		addGameToGroup,
		removeGameFromGroup,
	};
}
