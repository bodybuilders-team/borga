'use strict';


const errors = require('./borga-errors');
const crypto = require('crypto');
const fetch = require('node-fetch');


module.exports = function (
	es_url,
	idx_prefix
) {
	const tokensUri = `${es_url}/${idx_prefix}_tokens`;
	const usersUri = `${es_url}/${idx_prefix}_users`;
	const gamesUri = `${es_url}/${idx_prefix}_games`;
	const userGroupsUri = (userId) => `${usersUri}_${userId}_groups`;
	const groupGamesUri = (userId, groupId) => `${userGroupsUri(userId)}_${groupId}_games`;


	// ------------------------- Tokens -------------------------

	/**
	 * Return the userId associated with the given token.
	 * @param {String} token 
	 * @returns the userId associated with the given token
	 */
	async function tokenToUserId(token) {
		try {
			const response = await fetch(`${tokensUri}/_doc/${token}`);

			if (response.status == 200)
				return (await response.json())._source.userId;
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		return null;
	}


	/**
	 * Creates a token, randomly generated, associating it to a userId.
	 * Uses crypto.randomUUID() for random token generation.
	 * @param {String} token 
	 * @returns the created token
	 */
	async function createToken(userId) {
		const token = crypto.randomUUID();

		try {
			const response = await fetch(
				`${tokensUri}/_doc/${token}?refresh=wait_for`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId
					})
				}
			);
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		return token;
	}


	/**
	 * Gets an user token.
	 * @param {String} userId 
	 * @returns the user token
	 * @throws NOT_FOUND if the token doesn't exist
	 */
	async function getToken(userId) {
		try {
			const response = await fetch(`${tokensUri}/_search`);
			const tokens = (await response.json()).hits.hits;

			for (const token of tokens) {
				if (token._source.userId == userId)
					return token._id;
			}

			if (response.status == 400)
				throw (await response.json()).error;
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
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
	async function createNewUser(userId, userName, passwordHash) {
		let found = true;

		try { await getUser(userId) }
		catch (err) {
			if (err.name == "NOT_FOUND") found = false
			else throw err
		}
		if (found) throw errors.ALREADY_EXISTS({ userId });

		try {
			const response = await fetch(
				`${usersUri}/_doc/${userId}?refresh=wait_for`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userName,
						passwordHash
					})
				}
			);

			if (response.status != 201)
				throw (await response.json()).error;

			const token = await createToken(userId);

			return { userId, token, userName };
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}
	}


	/**
	 * Gets an user.
	 * @param {String} userId 
	 * @returns the user object
	 * @throws NOT_FOUND if the user doesn't exist
	 */
	async function getUser(userId) {
		try {
			const response = await fetch(`${usersUri}/_doc/${userId}`);

			if (response.status == 200)
				return (await response.json())._source;

			if (response.status == 400)
				throw (await response.json()).error;
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}
		throw errors.NOT_FOUND({ userId });
	}


	// ------------------------- Groups Functions -------------------------

	/**
	 * Writes a new group to the user.
	 * @param {String} userId 
	 * @param {String} groupId
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns an object with the wrote group information
	 */
	async function writeGroup(userId, groupId, groupName, groupDescription) {
		await getUser(userId);

		try {
			const response = await fetch(
				`${userGroupsUri(userId)}/_doc/${groupId}?refresh=wait_for`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: groupName,
						description: groupDescription
					})
				}
			);

			if (response.status != 200 && response.status != 201)
				throw (await response.json()).error;

			return {
				id: groupId,
				name: groupName,
				description: groupDescription
			};
		}
		catch (err) {
			throw errors.FAIL(err);
		}
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
	async function editGroup(userId, groupId, newGroupName, newGroupDescription) {
		const group = await getGroup(userId, groupId);

		return await writeGroup(
			userId,
			groupId,
			newGroupName ? newGroupName : group.name,
			newGroupDescription ? newGroupDescription : group.description
		);
	}


	/**
	 * Returns the group object of a group.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @returns group object
	 * @throws NOT_FOUND if the group doesn't exist
	 */
	async function getGroup(userId, groupId) {
		await getUser(userId);

		try {
			const response = await fetch(`${userGroupsUri(userId)}/_doc/${groupId}`);

			if (response.status == 200)
				return (await response.json())._source;
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}
		throw errors.NOT_FOUND({ groupId });
	}


	/**
	 * Lists all groups from a user.
	 * @param {String} userId 
	 * @returns object containing all group objects associated with their id
	 */
	async function listUserGroups(userId) {
		await getUser(userId);

		try {
			const response = await fetch(`${userGroupsUri(userId)}/_search`);

			if (response.status == 200) {
				const answer = await response.json();
				return Object.fromEntries(answer.hits.hits.map(hit => [hit._id, hit._source]));
			}
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		return {};
	}


	/**
	 * Deletes the group with the specified groupId.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @returns an object with the deleted group information
	 */
	async function deleteGroup(userId, groupId) {
		const group = await getGroup(userId, groupId);

		try {
			const response1 = await fetch(
				`${userGroupsUri(userId)}/_doc/${groupId}?refresh=wait_for`,
				{
					method: 'DELETE'
				}
			);

			const response2 = await fetch(
				`${groupGamesUri(userId, groupId)}`,
				{
					method: 'DELETE'
				}
			);

			if (response1.status == 200)
				return {
					id: groupId,
					name: group.name,
					description: group.description
				};
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		throw errors.NOT_FOUND({ groupId });
	}


	// ------------------------- Games Functions -------------------------

	/**
	 * Gets the details of a group, including a list of game ids.
	 * @param {Object} userId 
	 * @param {Object} groupId 
	 * @returns an object containing the details of a group
	 */
	async function getGroupDetails(userId, groupId) {
		const group = await getGroup(userId, groupId);

		let games = {};

		try {
			const response = await fetch(`${groupGamesUri(userId, groupId)}/_search`);

			if (response.status == 200) {
				const answer = await response.json();
				games = Object.fromEntries(answer.hits.hits.map(hit => [hit._id, hit._source.name]));
			}
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		return {
			id: groupId,
			name: group.name,
			description: group.description,
			games
		};
	}

	/**
	 * Adds a new game to a group.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @param {String} gameObj
	 * @return the id of the added game
	 */
	async function addGameToGroup(userId, groupId, gameObj) {
		await getGroup(userId, groupId);

		try {
			const response1 = await fetch(
				`${gamesUri}/_doc/${gameObj.id}?refresh=wait_for`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(gameObj)
				}
			);

			if (response1.status != 200 && response1.status != 201)
				throw (await response1.json()).error;

			const response2 = await fetch(
				`${groupGamesUri(userId, groupId)}/_doc/${gameObj.id}?refresh=wait_for`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: gameObj.name
					})
				}
			);

			if (response2.status != 200 && response2.status != 201)
				throw (await response2.json()).error;
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		return gameObj;
	}


	/**
	 * Removes a game from a group given its id.
	 * @param {String} userId 
	 * @param {String} groupId 
	 * @param {String} gameId
	 * @return the removed game object
	 */
	async function removeGameFromGroup(userId, groupId, gameId) {
		await getGroup(userId, groupId);

		try {
			const gamesResponse = await fetch(`${gamesUri}/_doc/${gameId}`);
			const answer = await gamesResponse.json();

			const groupGamesResponse = await fetch(
				`${groupGamesUri(userId, groupId)}/_doc/${gameId}?refresh=wait_for`,
				{
					method: 'DELETE'
				}
			);

			if (groupGamesResponse.status == 200)
				return answer._source;
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		throw errors.NOT_FOUND({ gameId });
	}


	return {
		//-- User --
		createNewUser,
		getUser,

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
		getToken
	};
}
