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

		for (let param in params){
			const value = params[param].value;

			if (!value) info[param] = "parameter missing";
		}
		for (let property in properties){
			const value = properties[property].value;
			const type = properties[property].type;

			if (!value) info[property] = "property missing";
			else if (typeof value !== type) info[property] = "wrong type. expected " + type + ". instead got " + typeof value;
		}

		if (Object.keys(info).length != 0) throw errors.BAD_REQUEST(info);
	}


	async function getPopularGames(){
		await data_int.getPopularGames();
	}

	async function searchGameByName(gameName){
		checkBadRequest({
			gameName: { value: gameName }
		}, {});

		await data_ext.getGameByName(gameName);
	}


	async function createNewUser(userId, username){
		checkBadRequest({}, {
			userId: { value: userId, type: 'string' },
			username: { value: username, type: 'string' }
		});

		await data_int.createNewUser(userId, username);
	}


	async function createGroup(userId, groupName, groupDescription){
		checkBadRequest({
			userId: { value: userId }
		}, {
			groupName: { value: groupName, type: 'string' },
			groupDescription: { value: groupDescription, type: 'string' }
		});

		await data_int.createGroup(userId, groupName, groupDescription);
	}


	async function editGroup(userId, groupName, newGroupName, newGroupDescription){
		checkBadRequest({
			userId: { value: userId }
		}, {
			groupName: { value: groupName, type: 'string' },
			newGroupName: { value: newGroupName, type: 'string' },
			newGroupDescription: { value: newGroupDescription, type: 'string' }
		});

		await data_int.editGroup(userId, groupName, newGroupName, newGroupDescription);
	}


	async function listUserGroups(userId){
		checkBadRequest({
			userId: { value: userId }
		}, {});

		await data_int.listUserGroups(userId);
	}


	async function deleteGroup(userId, groupName){
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName }
		}, {});

		await data_int.deleteGroup(userId, groupName);
	}


	async function getGroupDetails(userId, groupName){
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName }
		}, {});

		const group = await data_int.getGroup(userId, groupName);

		await data_int.getGroupDetails(group);
	}


	async function addGameToGroup(userId, groupName, gameName){
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName }
		}, {
			gameName: { value: gameName, type: 'string' }
		});

		const game = await data_ext.searchGameByName(gameName);

		await data_int.addGameToGroup(userId, groupName, game);
	}


	async function removeGameFromGroup(userId, groupName, gameName){
		checkBadRequest({
			userId: { value: userId },
			groupName: { value: groupName },
			gameName: { value: gameName }
		}, {});

		await data_int.removeGameFromGroup(userId, groupName, gameName);
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
