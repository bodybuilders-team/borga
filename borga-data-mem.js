'use strict';


const errors = require('./borga-errors');
const crypto = require('crypto');


module.exports = function (guest) {

	const DEFAULT_HASHED_PASSWORD = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

	/**
	 * Object that represents a map of all users: "userId": "userObj".
	 * Example of an userObj : {
	 * 		"name" : "Paulão",
	 * 		"hashedPassword": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
	 * 		"groups": {}
	 * }
	 * Contains 3 starting users.
	 */
	let users = {
		"a48280": createUserObj(
			"André Jesus",
			DEFAULT_HASHED_PASSWORD
		),
		"a48287": createUserObj(
			"Nyckollas Brandão",
			DEFAULT_HASHED_PASSWORD
		),
		"a48309": createUserObj(
			"André Santos",
			DEFAULT_HASHED_PASSWORD
		),
		[guest.id]: createUserObj(
			[guest.name],
			DEFAULT_HASHED_PASSWORD
		)
	};

	/**
	 * Object that represents a map of all games: "gameId": "gameObj".
	 */
	const games = {};

	/**
	 * Object containing the association between user token and userId: "token": "userId".
	 */
	let tokens = {
		'4869fdf7-0e62-46a2-872c-f0dc60fc2c81': "a48280",
		'3e39bce8-07d1-4c05-9ee3-5587e6b8e2e7': "a48287",
		'5d389af1-06db-4401-8aef-36d8d6428f31': "a48309",
		[guest.token]: [guest.id]
	};


	// ------------------------- Tokens -------------------------

	/**
	 * Return the userId associated with the given token.
	 * @param {String} token 
	 * @returns the userId associated with the given token
	 */
	function tokenToUserId(token) {
		return tokens[token];
	}


	/**
	 * Created a token, randomly generated.
	 * @returns the created token
	 */
	function createToken() {
		return crypto.randomUUID();
	}

	/**
	 * Gets an user token.
	 * @param {String} userId 
	 * @returns the user token
	 * @throws NOT_FOUND if the token doesn't exist
	 */
	function getToken(userId) {
		for (const token in tokens) {
			if (tokens[token] == userId)
				return token;
		}
		throw errors.NOT_FOUND({ 'token for user': userId });
	}


	// ------------------------- Users Functions -------------------------

	/**
	 * Creates a new user given its id and name.
	 * @param {String} userId 
	 * @param {String} userName 
	 * @param {String} passwordHash 
	 * @returns an object with the new user information
	 * @throws ALREADY_EXISTS if the user with userId already exists
	 */
	function createNewUser(userId, userName, passwordHash) {
		if (users[userId]) throw errors.ALREADY_EXISTS({ userId });

		const token = createToken();
		tokens[token] = userId;

		users[userId] = createUserObj(userName, passwordHash);

		return { userId, token, userName };
	}


	// ------------------------- Groups Functions -------------------------

	/**
	 * Adds a new group to the user.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns an object with the new group information
	 * @throws ALREADY_EXISTS if the user already has a group with the given groupId
	 */
	function writeGroup(userId, groupId, groupName, groupDescription) {
		const user = getUser(userId)
		if (user.groups[groupId]) throw errors.ALREADY_EXISTS({ groupId });

		const groupObj = createGroupObj(groupName, groupDescription)
		user.groups[groupId] = groupObj;

		return {
			id: groupId,
			name: groupObj.name,
			description: groupObj.description
		};
	}


	// Creates a group
	const createGroup = writeGroup;


	/**
	 * Edits a group by changing its name and description.
	 * @param {String} userId 
	 * @param {String} groupId
	 * @param {String} newGroupName 
	 * @param {String} newGroupDescription 
	 * @returns an object with the edited group information
	 */
	function editGroup(userId, groupId, newGroupName, newGroupDescription) {
		const group = getGroupFromUser(userId, groupId);
		group.name = newGroupName ? newGroupName : group.name;
		group.description = newGroupDescription ? newGroupDescription : group.description;

		return {
			id: groupId,
			name: group.name,
			description: group.description
		};
	}


	/**
	 * Lists all user groups.
	 * @param {String} userId 
	 * @returns object containing all group objects
	 */
	function listUserGroups(userId) {
		const groups = getUser(userId).groups;

		return Object.fromEntries(
			Object.entries(groups).map(group =>
				[
					group[0],
					{
						name: group[1].name,
						description: group[1].description
					}
				]
			)
		);
	}


	/**
	 * Deletes the group with the specified groupId.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @returns an object with the deleted group information
	 */
	function deleteGroup(userId, groupId) {
		const group = getGroupFromUser(userId, groupId);
		delete getUser(userId).groups[groupId];
		return {
			id: groupId,
			name: group.name,
			description: group.description
		};
	}


	/**
	 * Gets the details of a group, including a list of game ids.
	 * @param {Object} userId 
	 * @param {Object} groupId 
	 * @returns an object containing the details of a group
	 */
	function getGroupDetails(userId, groupId) {
		const group = getGroupFromUser(userId, groupId);
		return {
			id: groupId,
			name: group.name,
			description: group.description,
			games: group.games
		};
	}


	// ------------------------- Games Functions -------------------------

	/**
	 * Adds a new game to a group.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @param {Object} gameObj
	 * @return the added game object
	 */
	function addGameToGroup(userId, groupId, gameObj) {
		const gameId = gameObj.id;
		games[gameId] = gameObj;
		getGroupFromUser(userId, groupId).games[gameId] = gameObj.name;
		return gameObj;
	}


	/**
	 * Removes a game from a group given its id.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @param {String} gameId
	 * @return the removed game object
	 */
	function removeGameFromGroup(userId, groupId, gameId) {
		const game = getGameFromGroup(userId, groupId, gameId);

		delete getGroupFromUser(userId, groupId).games[gameId];
		return game;
	}


	// ------------------------- Utils -------------------------


	/**
	 * Creates a new user object given its name and hashed password.
	 * @param {String} userName 
	 * @param {String} passwordHash 
	 * @returns the user object 
	 */
	function createUserObj(userName, passwordHash) {
		return {
			userName,
			passwordHash,
			groups: {}
		};
	}


	/**
	 * Creates a new group given its name and description.
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns the group object 
	 */
	function createGroupObj(groupName, groupDescription) {
		return {
			name: groupName,
			description: groupDescription,
			games: {}
		};
	}


	/**
	 * Gets the user with the given userId.
	 * @param {String} userId
	 * @returns the user object
	 * @throws NOT_FOUND if the user was not found
	 */
	function getUser(userId) {
		const userObj = users[userId];
		if (!userObj) throw errors.NOT_FOUND({ userId });
		return userObj;
	}


	/**
	 * Gets the group with the given groupId and userId.
	 * @param {String} userId
	 * @param {String} groupId 
	 * @returns the group object
	 * @throws NOT_FOUND if the group was not found
	 */
	function getGroupFromUser(userId, groupId) {
		const groupObj = getUser(userId).groups[groupId];
		if (!groupObj) throw errors.NOT_FOUND({ groupId });
		return groupObj;
	}


	/**
	 * Gets the game with the given gameId.
	 * @param {String} userId
	 * @param {String} groupId
	 * @param {String} gameId
	 * @returns the game object
	 * @throws NOT_FOUND if the game was not found
	 */
	function getGameFromGroup(userId, groupId, gameId) {
		const gameName = getGroupFromUser(userId, groupId).games[gameId];
		const game = games[gameId];
		if (!game || !gameName) throw errors.NOT_FOUND({ gameId });
		return game;
	}


	/**
	 * Resets memory by assigning {} to the object users and the object tokens.
	 */
	function resetMem() {
		users = {};
		tokens = {};
	}


	/**
	 * Resets all users groups by assigning {} to the object groups of each user.
	 */
	function resetAllGroups() {
		Object.values(users).forEach(user => {
			user.groups = {};
		});
	}


	return {
		//-- User --
		createNewUser,

		//-- Group --
		createGroup,
		editGroup,
		listUserGroups,
		deleteGroup,
		getGroupDetails,

		//-- Game --
		addGameToGroup,
		removeGameFromGroup,

		//-- Tokens --
		tokenToUserId,
		getToken,

		//-- Utils --
		createUserObj,
		createGroupObj,
		getUser,
		getGroupFromUser,
		getGameFromGroup,

		resetMem,
		resetAllGroups
	};
}
