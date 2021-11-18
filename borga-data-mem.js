'use strict';

module.exports = {
    hasUser,
    userHasGroup,
    addUser,
    addGroupToUser,
    getUser,
    getGroupFromUser,
    deleteUser,
    deleteGroupFromUser,
    listUsers,
    listGroupsFromUser,
    createUser,
    createGroup,
    getGroupDetails,
    editGroupInUser,
    addGameToGroupInUser,
    removeGameFromGroupInUser
};

const errors = require('./app-errors');


/**
 * Object that represents a map of all users
 */
const users = {};


/**
 * Returns true if the user exists within the users object
 * @param {String} userId 
 * @returns true if the user exists within the users object
 */
 const hasUser = async (userId) => users[userId];


/**
 * Returns true if the group exists within the groups object inside the user
 * @param {String} userId
 * @param {String} groupName 
 * @returns true if the group exists within the groups object inside the user
 */
const userHasGroup = async (userId, groupName) => users[userId].groups[groupName];


/**
 * Adds a new user to the users object
 * @param {String} userId
 * @param {Object} userObj 
 * @returns the name of the added user
 */
 async function addUser(userId, userObj) {
    users[userId] = userObj;
    return userId;
}


/**
 * Adds a new group to the groups object list inside the user
 * @param {String} userId
 * @param {Object} groupObj 
 * @returns the name of the added group
 */
 async function addGroupToUser(userId, groupObj) {
    const groupName = groupObj.name;
    users[userId].groups[groupName] = groupObj;
    return groupName;
}


/**
 * Returns the user of the specified userId
 * @param {String} userId
 * @returns the user object
 */
 async function getUser(userId) {
    const userObj = users[userId];
    if (!userObj) {
        const err = errors.NOT_FOUND({ id: userId });
        throw err;
    }
    return userObj;
}


/**
 * Returns the group of the specified group name and userId
 * @param {String} userId
 * @param {String} groupName 
 * @returns the group object
 */
async function getGroupFromUser(userId, groupName) {
    const groupObj = users[userId].groups[groupName];
    if (!groupObj) {
        const err = errors.NOT_FOUND({ name: groupName });
        throw err;
    }
    return groupObj;
}


/**
 * Deletes the user of the specified userId
 * @param {String} userId 
 * @returns id of the deleted user
 */
async function deleteUser(userId) {
    const userObj = users[userId];
    if (!userObj) {
        throw errors.NOT_FOUND({ id: userId });
    }
    delete users[userId];
    return userId;
}


/**
 * Deletes the group of the specified groupName
 * @param {String} userId 
 * @param {String} groupName 
 * @returns name of the deleted group
 */
 async function deleteGroupFromUser(userId, groupName) {
    const groupObj = users[userId].groups[groupName];
    if (!groupObj) {
        throw errors.NOT_FOUND({ name: groupName });
    }
    delete users[userId].groups[groupName];
    return groupName;
}


/**
 * List all existing users
 * @returns array containing all user objects
 */
 async function listUsers() {
    return Object.values(users);
}


/**
 * List all existing groups inside the user 
 * @param {String} userId 
 * @returns array containing all group objects
 */
async function listGroupsFromUser(userId) {
    return Object.values(users[userId].groups);
}


/**
 * Creates a new user providing its name
 * @param {String} userName 
 * @returns a user object 
 */
 async function createUser(userName) {
    return {
        name: userName,
        groups: {}
    };
}


/**
 * Creates a new group providing its name and description
 * @param {String} groupName 
 * @param {String} groupDescription 
 * @returns a group object 
 */
async function createGroup(groupName, groupDescription) {
    return {
        name: groupName,
        description: groupDescription,
        games: {}
    };
}


/**
 * Creates a new object containing the group details
 * @param {Object} groupObj 
 * @returns an object containing the group details
 */
 async function getGroupDetails(groupObj) {
    return {
        name: groupObj.name,
        description: groupObj.description,
        games: Object.values(groupObj.games).map(game => game.name)
    };
}


/**
 * Edits a group by changing its name and description 
 * @param {String} userId 
 * @param {String} groupName 
 * @param {String} newGroupName 
 * @param {String} newGroupDescription 
 * @returns the new group name
 */
async function editGroupInUser(userId, groupName, newGroupName, newGroupDescription) {
    const myGroup = getGroupFromUser(userId, groupName);
    myGroup.name = newGroupName;
    myGroup.description = newGroupDescription;
    return newGroupName;
}


/**
 * Adds a new game to a group
 * @param {String} userId 
 * @param {String} groupName 
 * @param {Object} gameObj
 * @return name of the added name
 */
async function addGameToGroupInUser(userId, groupName, gameObj) {
    users[userId].groups[groupName].games[gameObj.name] = gameObj;
    return gameObj.name;
}


/**
 * Removes a game from a group providing its name
 * @param {String} userId 
 * @param {String} groupName 
 * @param {String} gameName
 * @return name of removed game 
 */
async function removeGameFromGroupInUser(userId, groupName, gameName) {
    delete users[userId].groups[groupName].games[gameName];
    return gameName;
}
