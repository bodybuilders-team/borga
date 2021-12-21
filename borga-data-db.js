'use strict';


const errors = require('./borga-errors');
const crypto = require('crypto');
const fetch = require('node-fetch')


module.exports = function (
	es_url,
	idx_prefix
) {
	const tokensUri = `${es_url}/${idx_prefix}_tokens`;
	const usersUri = `${es_url}/${idx_prefix}_users`;
	const gamesUri = `${es_url}/${idx_prefix}_games`;
	const userGroupsUri = (userId) => `${usersUri}_${userId}_groups`;
	const groupGamesUri = (userId, groupId) => `${userGroupsUri(userId)}_${groupId}_games`;

	const numberOfPopularGames = 20;


	/**
	 * Gets the most popular games.
	 * @returns an object containing the ids and information of the twenty most popular games
	 */
	async function getPopularGames() {
		const gameOccurrences = {};

		try {
			const usersResponse = await fetch(`${usersUri}/_search`);

			if (usersResponse.status == 200) {
				const usersAnswer = await usersResponse.json();

				await Promise.all(usersAnswer.hits.hits.map(async (user) => {
					let foundGamesInUser = [];

					const groupsResponse = await fetch(`${userGroupsUri(user._id)}/_search`);

					if (groupsResponse.status == 200) {
						const groupsAnswer = await groupsResponse.json();

						await Promise.all(groupsAnswer.hits.hits.map(async (group) => {
							const gamesResponse = await fetch(`${groupGamesUri(user._id, group._id)}/_search`);

							if (gamesResponse.status == 200) {
								const gamesAnswer = await gamesResponse.json();

								await Promise.all(gamesAnswer.hits.hits.map(async (game) => {
									if (!foundGamesInUser.includes(game._id)) {
										if (!gameOccurrences[game._id]) {
											gameOccurrences[game._id] = {
												game: (await (await fetch(`${gamesUri}/_doc/${game._id}`)).json())._source,
												count: 1
											};
										}
										else gameOccurrences[game._id].count += 1;

										foundGamesInUser.push(game._id);
									}
								}));
							}
						}));
					}
				}));
			}
		}
		catch (err) {
			console.log(err);
			throw errors.FAIL(err);
		}

		const sortedGames = Object.entries(gameOccurrences).sort(([, a], [, b]) => b.count - a.count).slice(0, numberOfPopularGames);
		const popularGames = Object.fromEntries(sortedGames.map(game => [game[0], game[1].game]));

		return popularGames;
	}

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
	 * Creates a token, associating it to a userId.
	 * @param {String} token 
	 * @returns token
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

	// ------------------------- Users Functions -------------------------

	/**
	 * Creates a new user given its id and name.
	 * @param {String} userId 
	 * @param {String} userName 
	 * @returns an object with the new user information
	 * @throws ALREADY_EXISTS if the user with userId already exists
	 */
	async function createNewUser(userId, userName) {
		let found = true

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
						userName
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
	 * Adds a new group to the user.
	 * @param {String} userId 
	 * @param {String} groupId
	 * @param {String} groupName 
	 * @param {String} groupDescription 
	 * @returns an object with the new group information
	 */
	async function createGroup(userId, groupId, groupName, groupDescription) {
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

		return await createGroup(
			userId,
			groupId,
			newGroupName ? newGroupName : group.groupName,
			newGroupDescription ? newGroupDescription : group.groupDescription
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
			await fetch(
				`${userGroupsUri(userId)}/_doc/${groupId}?refresh=wait_for`,
				{
					method: 'DELETE'
				}
			);

			await fetch(
				`${groupGamesUri(userId, groupId)}`,
				{
					method: 'DELETE'
				}
			);

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

		let games = [];

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
		getPopularGames,

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
		tokenToUserId
	};
}
