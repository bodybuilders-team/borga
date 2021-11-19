'use strict';


const errors = require('./borga-errors');


/**
 * Object that represents a map of all users.
 */
const users = {};


/**
 * Gets the most popular games.
 * @returns an array containing the twenty most popular games
 */
function getPopularGames() {
    const games = {};

    for (const userId in users) {
        for (const groupName in getUser(userId).groups) {
            for (const gameName in getGroupFromUser(userId, groupName).games) {
                const currentCount = games[gameName];
                games[gameName] = currentCount ? currentCount + 1 : 1;
            }
        }
    }

    const sortedGames = Object.entries(games).sort(([, a], [, b]) => b - a);
    const popularGames = [];

    for (let i = 0; i < 20 && i < sortedGames.length; i++)
        popularGames[i] = sortedGames[i][0];

    return popularGames;
}


// ------------------------- Users Functions -------------------------


/**
 * Creates a new user by its id and name.
 * @param {String} userId 
 * @param {String} userName 
 * @returns userId of the new user
 */
function createNewUser(userId, userName) {
    return addUser(userId, createUserObj(userName));
}


/**
 * Deletes the user of the specified userId.
 * @param {String} userId 
 * @returns id of the deleted user
 */
function deleteUser(userId) {
    delete getUser(userId);
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
 */
function createGroup(userId, groupName, groupDescription) {
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
    group.name = newGroupName;
    group.description = newGroupDescription;
    return newGroupName;
}


/**
 * List all existing groups inside the user.
 * @param {String} userId 
 * @returns array containing all group objects
 */
function listUserGroups(userId) {
    return Object.values(getUser(userId).groups);
}


/**
 * Deletes the group of the specified groupName.
 * @param {String} userId 
 * @param {String} groupName 
 * @returns name of the deleted group
 */
function deleteGroup(userId, groupName) {
    delete getGroupFromUser(userId, groupName);
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
        games: Object.values(groupObj.games).map(game => game.name)
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
    getGroupFromUser(userId, groupName).games[gameName] = gameObj;
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
    delete getGameFromGroup(userId, groupName, gameName);
    return gameName;
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
 * Adds a new user to the users object.
 * @param {String} userId
 * @param {Object} userObj 
 * @returns userId of the added user
 */
function addUser(userId, userObj) {
    users[userId] = userObj;
    return userId;
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
    if (!userObj) throw errors.NOT_FOUND({ id: userId });
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
    if (!groupObj) throw errors.NOT_FOUND({ name: groupName });
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
    const gameObj = getGroupFromUser(userId, groupName).games[gameName];
    if (!gameObj) throw errors.NOT_FOUND({ name: gameName });
    return gameObj;
}



module.exports = {
    getPopularGames,

    createGroup,
    editGroup,
    listUserGroups,
    deleteGroup,
    getGroupDetails,

    addGameToGroup,
    removeGameFromGroup,

    createNewUser,
    hasUser: getUser
};
