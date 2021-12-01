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
	 * Returns the username associated with the provided token by checking if said token exists.
	 * @param {String} userId
	 * @param {String} token 
	 * @returns the user id associated with the provided token
	 */
	function checkAuthentication(userId, token) {
		if (!token) {
			throw errors.UNAUTHENTICATED('Please insert your user token');
		}

		if(userId != data_int.tokenToUserID(token)) {
			throw errors.UNAUTHENTICATED('Please insert a valid user token');
		}
	}


	/**
	 * Gets the most popular games.
	 * @returns a promise with an array containing the twenty most popular games
	 */
	async function getPopularGames() {
		return await data_int.getPopularGames();
	}


	/**
	 * Gets a game by its name.
	 * @param {String} gameName
	 * @throws error NOT_FOUND if no game was found with the given name
	 * @returns promise with the game object response
	 */
	async function searchGameByName(gameName) {
		return await data_ext.searchGameByName(gameName);
	}


	/**
	 * Creates a new user by its id and name.
	 * @param {String} userId 
	 * @param {String} username 
	 * @returns a promise with the an object with the new user information
	 */
	async function createNewUser(userId, username) {
		checkBadRequest({
			userId: { value: userId, type: 'string' },
			username: { value: username, type: 'string' }
		});

		return await data_int.createNewUser(userId, username);
	}


	/**
	 * Creates a new group of the user.
	 * @param {String} userId
	 * @param {String} token 
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns promise with the name of the new group
	 */
	async function createGroup(userId, token, groupName, groupDescription) {
		checkBadRequest({
			groupName: { value: groupName, type: 'string' },
			groupDescription: { value: groupDescription, type: 'string' }
		});
		checkAuthentication(userId, token);

		return await data_int.createGroup(userId, groupName, groupDescription);
	}


	/**
	 * Edits a group by changing its name and description.
	 * @param {String} userId
	 * @param {String} token 
	 * @param {String} groupName 
	 * @param {String} newGroupName 
	 * @param {String} newGroupDescription 
	 * @returns promise with the new group name
	 */
	async function editGroup(userId, token, groupName, newGroupName, newGroupDescription) {
		checkBadRequest({
			groupName: { value: groupName, type: 'string' },
			newGroupName: { value: newGroupName, type: 'string' },
			newGroupDescription: { value: newGroupDescription, type: 'string' }
		});
		checkAuthentication(userId, token);

		return await data_int.editGroup(userId, groupName, newGroupName, newGroupDescription);
	}


	/**
	 * List all existing groups inside the user.
	 * @param {String} userId
	 * @param {String} token 
	 * @returns promise with object containing all group objects
	 */
	async function listUserGroups(userId, token) {
		checkAuthentication(userId, token);

		return await data_int.listUserGroups(userId);
	}


	/**
	 * Deletes the group of the specified groupName.
	 * @param {String} userId
	 * @param {String} token 
	 * @param {String} groupName 
	 * @returns promise with name of the deleted group
	 */
	async function deleteGroup(userId, token, groupName) {
		checkAuthentication(userId, token);

		return await data_int.deleteGroup(userId, groupName);
	}


	/**
	 * Creates a new object containing the group details.
	 * @param {String} userId
	 * @param {String} token
	 * @param {Object} groupName
	 * @returns promise an object containing the group details
	 */
	async function getGroupDetails(userId, token, groupName) {
		checkAuthentication(userId, token);

		const group = await data_int.getGroupFromUser(userId, groupName);

		return await data_int.getGroupDetails(group);
	}


	/**
	 * Adds a new game to a group.
	 * @param {String} userId
	 * @param {String} token
	 * @param {String} groupName 
	 * @param {Object} gameName
	 * @return promise with name of the added name
	 */
	async function addGameToGroup(userId, token, groupName, gameName) {
		checkAuthentication(userId, token);

		const game = await data_ext.searchGameByName(gameName);

		return await data_int.addGameToGroup(userId, groupName, game);
	}


	/**
	 * Removes a game from a group providing its name.
	 * @param {String} userId
	 * @param {String} token 
	 * @param {String} groupName 
	 * @param {String} gameName
	 * @return promise with name of removed game 
	 */
	async function removeGameFromGroup(userId, token, groupName, gameName) {
		checkAuthentication(userId, token);

		return await data_int.removeGameFromGroup(userId, groupName, gameName);
	}


	return {
		getPopularGames,
		searchGameByName,

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
