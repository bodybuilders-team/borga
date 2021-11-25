'use strict';


const errors = require('./borga-errors');
const crypto = require('crypto');

const numberOfPopularGames = 20;


/**
 * Object that represents a map of all users: "userId": "userObj".
 * Contains 3 starting users.
 */
let users = {
	"A48280": createUserObj("André Jesus"),
	"A48287": createUserObj("Nyckollas Brandão"),
	"A48309": createUserObj("André Santos")
};

/**
 * Object that represents a map of all games: "gameId": "gameObj".
 */
const games = {};


/**
 * Object containing the association between user token and userId: "token": "userId".
 */
const tokens = {};


/**
 * Gets the most popular games.
 * @returns an array containing the twenty most popular games
 */
function getPopularGames() {
	const gameOccurences = {};

	for (const userId in users) {
		for (const groupName in getUser(userId).groups) {
			for (const gameName in getGroupFromUser(userId, groupName).games) {
				const currentCount = gameOccurences[gameName];
				gameOccurences[gameName] = currentCount ? currentCount + 1 : 1;
			}
		}
	}

	const sortedGames = Object.entries(gameOccurences).sort(([, a], [, b]) => b - a);
	const popularGames = [];

	for (let i = 0; i < numberOfPopularGames && i < sortedGames.length; i++)
		popularGames[i] = sortedGames[i][0];

	return popularGames;
}


// ------------------------- Users Functions -------------------------


/**
 * Creates a new user by its id and name.
 * @param {String} userId 
 * @param {String} userName 
 * @returns an object with the new user information
 * @throws ALREADY_EXISTS if the user already exists
 */
function createNewUser(userId, userName) {
	if (users[userId]) throw errors.ALREADY_EXISTS({ userId });

	const token = crypto.randomUUID()
	tokens[token] = userId;

	users[userId] = createUserObj(userName);

	return { userId, token, userName }
}


/**
 * Deletes the user of the specified userId.
 * @param {String} userId 
 * @returns id of the deleted user
 */
function deleteUser(userId) {
	getUser(userId);
	delete tokens[UserIDtoToken(userId)];
	delete users[userId];
	return userId;
}


/**
 * List all existing users.
 * @returns array containing all user objects
 */
function listUsers() {
	return Object.values(users);
}


// ------------------------- Groups Functions -------------------------


/**
 * Creates a new group of the user.
 * @param {String} userId 
 * @param {String} groupName 
 * @param {String} groupDescription 
 * @returns the name of the new group
 * @throws ALREADY_EXISTS if the group already exists
 */
function createGroup(userId, groupName, groupDescription) {
	if (getUser(userId).groups[groupName]) throw errors.ALREADY_EXISTS({ groupName })
	return addGroupToUser(userId, createGroupObj(groupName, groupDescription));
}


/**
 * Edits a group by changing its name and description.
 * @param {String} userId 
 * @param {String} groupName 
 * @param {String} newGroupName 
 * @param {String} newGroupDescription 
 * @returns the new group name
 */
function editGroup(userId, groupName, newGroupName, newGroupDescription) {
	const group = getGroupFromUser(userId, groupName);
	deleteGroup(userId, groupName);

	group.name = newGroupName;
	group.description = newGroupDescription;
	addGroupToUser(userId, group);

	return newGroupName;
}


/**
 * List all existing groups inside the user.
 * @param {String} userId 
 * @returns object containing all group objects
 */
function listUserGroups(userId) {
	return getUser(userId).groups;
}


/**
 * Deletes the group of the specified groupName.
 * @param {String} userId 
 * @param {String} groupName 
 * @returns name of the deleted group
 */
function deleteGroup(userId, groupName) {
	getGroupFromUser(userId, groupName);

	delete getUser(userId).groups[groupName];
	return groupName;
}


/**
 * Creates a new object containing the group details.
 * @param {Object} groupObj 
 * @returns an object containing the group details
 */
function getGroupDetails(groupObj) {
	return {
		name: groupObj.name,
		description: groupObj.description,
		games: Object.keys(groupObj.games)
	};
}


// ------------------------- Games Functions -------------------------


/**
 * Adds a new game to a group.
 * @param {String} userId 
 * @param {String} groupName 
 * @param {Object} gameObj
 * @return name of the added name
 */
function addGameToGroup(userId, groupName, gameObj) {
	const gameName = gameObj.name;
	const gameId = gameObj.id;
	games[gameId] = gameObj;
	getGroupFromUser(userId, groupName).games[gameName] = gameObj.id;
	return gameName;
}


/**
 * Removes a game from a group providing its name.
 * @param {String} userId 
 * @param {String} groupName 
 * @param {String} gameName
 * @return name of removed game 
 */
function removeGameFromGroup(userId, groupName, gameName) {
	getGameFromGroup(userId, groupName, gameName);

	delete getGroupFromUser(userId, groupName).games[gameName];
	return gameName;
}


// ------------------------- Tokens -------------------------

/**
 * Returns the token associated with the provided userId.
 * @param {String} userId 
 * @returns the token associated with the provided userId
 */
function UserIDtoToken(userId) {
	return Object.keys(tokens).find(token => tokens[token] === userId);
}


/**
 * Return the userId associated with the provided token.
 * @param {String} token 
 * @returns the userId associated with the provided token
 */
async function tokenToUserID(token) {
	return tokens[token];
}

// ------------------------- Utils -------------------------


/**
 * Creates a new user object providing its name.
 * @param {String} userName 
 * @returns the user object 
 */
function createUserObj(userName) {

	return {
		name: userName,
		groups: {}
	};
}


/**
 * Creates a new group providing its name and description.
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
 * Adds a new group to the groups object list inside the user.
 * @param {String} userId
 * @param {Object} groupObj 
 * @returns the name of the added group
 */
function addGroupToUser(userId, groupObj) {
	const groupName = groupObj.name;
	getUser(userId).groups[groupName] = groupObj;
	return groupName;
}


/**
 * Gets the user of the specified userId.
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
 * Gets the group of the specified group name and userId.
 * @param {String} userId
 * @param {String} groupName 
 * @returns the group object
 * @throws NOT_FOUND if the group was not found
 */
function getGroupFromUser(userId, groupName) {
	const groupObj = getUser(userId).groups[groupName];
	if (!groupObj) throw errors.NOT_FOUND({ groupName });
	return groupObj;
}


/**
 * Gets the game of the specified game name.
 * @param {String} userId
 * @param {String} groupName
 * @param {String} gameName
 * @returns the game object
 * @throws NOT_FOUND if the game was not found
 */
function getGameFromGroup(userId, groupName, gameName) {
	const gameId = getGroupFromUser(userId, groupName).games[gameName];
	const game = games[gameId];
	if (!game) throw errors.NOT_FOUND({ gameName });
	return game;
}

/**
 * Resets memory by assigning {} to the object users.
 */
function resetMem() {
	users = {}
}



module.exports = {
	getPopularGames,

	//-- User --
	createNewUser,
	deleteUser,
	listUsers,

	//-- Group --
	createGroup,
	editGroup,
	listUserGroups,
	deleteGroup,
	getGroupDetails,

	//-- Game --
	addGameToGroup,
	removeGameFromGroup,

	//-- Utils --
	createUserObj,
	createGroupObj,
	addGroupToUser,
	getUser,
	getGroupFromUser,
	getGameFromGroup,

	resetMem
};
