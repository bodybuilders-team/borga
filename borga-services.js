'use strict';


module.exports = function (data_ext, data_int) {

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
	 * Gets the most popular games.
	 * @returns a promise with an array containing the twenty most popular games
	 */
	async function getPopularGames() {
		return await data_int.getPopularGames();
	}


	/**
	 * Gets a game by its name.
	 * @param {String} name
	 * @throws error NOT_FOUND if no game was found with the given name
	 * @returns promise with the game object response
	 */
	async function searchGameByName(gameName) {
		checkBadRequest({
			gameName: { value: gameName }
		}, {});

		return await data_ext.getGameByName(gameName);
	}


	/**
	 * Creates a new user by its id and name.
	 * @param {String} userId 
	 * @param {String} userName 
	 * @returns a promise with the userId of the new user
	 */
	async function createNewUser(userId, username) {
		checkBadRequest({}, {
			userId: { value: userId, type: 'string' },
			username: { value: username, type: 'string' }
		});

		return await data_int.createNewUser(userId, username);
	}


	/**
	 * Creates a new group of the user.
	 * @param {String} userId 
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns promise with the name of the new group
	 */
	async function createGroup(userId, groupName, groupDescription) {
		checkBadRequest({
			userId: { value: userId }
		}, {
			groupName: { value: groupName, type: 'string' },
			groupDescription: { value: groupDescription, type: 'string' }
		});

		return await data_int.createGroup(userId, groupName, groupDescription);
	}


	/**
	 * Edits a group by changing its name and description.
	 * @param {String} userId 
	 * @param {String} groupName 
	 * @param {String} newGroupName 
	 * @param {String} newGroupDescription 
	 * @returns promise with the new group name
	 */
	async function editGroup(userId, groupName, newGroupName, newGroupDescription) {
		checkBadRequest({
			userId: { value: userId }
		}, {
			groupName: { value: groupName, type: 'string' },
			newGroupName: { value: newGroupName, type: 'string' },
			newGroupDescription: { value: newGroupDescription, type: 'string' }
		});

		return await data_int.editGroup(userId, groupName, newGroupName, newGroupDescription);
	}


	/**
	 * List all existing groups inside the user.
	 * @param {String} userId 
	 * @returns promise with object containing all group objects
	 */
	async function listUserGroups(userId) {
		checkBadRequest({
			userId: { value: userId }
		}, {});

		return await data_int.listUserGroups(userId);
	}


	/**
	 * Deletes the group of the specified groupName.
	 * @param {String} userId 
	 * @param {String} groupName 
	 * @returns promise with name of the deleted group
	 */
	async function deleteGroup(userId, groupName) {
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName }
		}, {});

		return await data_int.deleteGroup(userId, groupName);
	}


	/**
	 * Creates a new object containing the group details.
	 * @param {Object} groupObj 
	 * @returns promise an object containing the group details
	 */
	async function getGroupDetails(userId, groupName) {
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName }
		}, {});

		const group = await data_int.getGroup(userId, groupName);

		return await data_int.getGroupDetails(group);
	}


	/**
	 * Adds a new game to a group.
	 * @param {String} userId 
	 * @param {String} groupName 
	 * @param {Object} gameObj
	 * @return promise with name of the added name
	 */
	async function addGameToGroup(userId, groupName, gameName) {
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName }
		}, {
			gameName: { value: gameName, type: 'string' }
		});

		const game = await data_ext.searchGameByName(gameName);

		return await data_int.addGameToGroup(userId, groupName, game);
	}


	/**
	 * Removes a game from a group providing its name.
	 * @param {String} userId 
	 * @param {String} groupName 
	 * @param {String} gameName
	 * @return promise with name of removed game 
	 */
	async function removeGameFromGroup(userId, groupName, gameName) {
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName },
			gameName: { value: gameName }
		}, {});

		return await data_int.removeGameFromGroup(userId, groupName, gameName);
	}


	return {
		getPopularGames: getPopularGames,
		searchGameByName: searchGameByName,

		createNewUser: createNewUser,
		createGroup: createGroup,
		editGroup: editGroup,
		listUserGroups: listUserGroups,
		deleteGroup: deleteGroup,
		getGroupDetails: getGroupDetails,
		addGameToGroup: addGameToGroup,
		removeGameFromGroup: removeGameFromGroup,
	};
}
