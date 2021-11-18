'use strict';

module.exports = {
    hasGroup,
    addGroup,
    getGroup,
    deleteGroup,
    listGroups,
    createGroup,
    editGroup,
    addGameToGroup,
    removeGameFromGroup
};

const errors = require('./app-errors');


/**
 * Object that represents a map of all groups of saved games
 */
const groups = {};


/**
 * Returns true if the group exists within the groups object
 * @param {Number} groupName 
 * @returns true if the group exists within the groups object
 */
const hasGroup = async (groupName) => groups[groupName];


/**
 * Adds a new group to the groups object list 
 * @param {Object} groupObj 
 * @returns the name of the added group
 */
async function addGroup(groupObj) {
    const groupName = groupObj.name;
    groups[groupName] = groupObj;
    return groupName;
}


/**
 * Returns the group of the specified group name
 * @param {String} groupName 
 * @returns the group object
 */
async function getGroup(groupName) {
    const groupObj = groups[groupName];
    if (!groupObj) {
        const err = errors.NOT_FOUND({ name: groupName });
        throw err;
    }
    return groupObj;
}


/**
 * Deletes the group of the specified group name
 * @param {String} groupName 
 * @returns name of the deleted group
 */
async function deleteGroup(groupName) {
    const groupObj = groups[groupName];
    if (!groupObj) {
        throw errors.NOT_FOUND({ name: groupName });
    }
    delete groups[groupName];
    return groupName;
}


/**
 * List all existing groups 
 * @returns array containg all group objects
 */
async function listGroups() {
    return Object.values(groups);
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
 * Edits a group by changing its name and description 
 * @param {String} groupName 
 * @param {String} newGroupName 
 * @param {String} newGroupDescription 
 * @returns the new group name
 */
async function editGroup(groupName, newGroupName, newGroupDescription) {
    const myGroup = getGroup(groupName);
    myGroup.name = newGroupName;
    myGroup.description = newGroupDescription;
    return newGroupName;
}


/**
 * Adds a new game to a group
 * @param {String} groupName 
 * @param {Object} gameObj
 * @return name of the added name
 */
async function addGameToGroup(groupName, gameObj) {
    groups[groupName].games[gameObj.name] = gameObj;
    return gameObj.name;
}


/**
 * Removes a game from a group providing its name
 * @param {String} groupName 
 * @param {String} gameName
 * @return name of removed game 
 */
async function removeGameFromGroup(groupName, gameName) {
    delete groups[groupName].games[gameName];
    return gameName;
}
