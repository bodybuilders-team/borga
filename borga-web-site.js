'use strict';


const express = require('express');


module.exports = function (services) {


	/**
	 * Gets the userId from the request.
	 * @param {Object} req 
	 * @returns the userId from the request
	 */
	function getUserId(req) {
		return req.user && req.user.userId;
	}


	/**
	 * Gets the token from the request.
	 * @param {Object} req 
	 * @returns the token from the request
	 */
	function getBearerToken(req) {
		return req.user && req.user.token;
	}


	/**
	 * Gets the home page.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	function getHomepage(req, res) {
		res.render('home', { user: req.user });
	}


	/**
	 * Gets the search page.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	function getSearchPage(req, res) {
		res.render('search', { user: req.user });
	}


	/**
	 * Shows game details.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function showGameDetails(req, res) {
		const gameId = req.params.gameId;
		try {
			const game = await services.getGameDetails(gameId);
			const groups = (req.user)
				? await services.listUserGroups(getBearerToken(req), getUserId(req))
				: {}
			res.render('gameDetails', { header: 'Game Details', game, groups, user: req.user });
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Shows the twenty most popular games.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function showPopularGames(req, res) {
		try {
			const games = await services.getPopularGames();
			const groups = (req.user)
				? await services.listUserGroups(getBearerToken(req), getUserId(req))
				: {}

			res.render('games', { header: 'Popular Games', games, groups, user: req.user });
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Shows the details of the searched games.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function showSearchedGames(req, res) {
		const gameName = req.query.gameName;
		const limit = req.query.limit;
		const order_by = req.query.order_by;

		try {
			const games = await services.searchGamesByName(gameName, limit, order_by);
			const groups = (req.user)
				? await services.listUserGroups(getBearerToken(req), getUserId(req))
				: {}
			res.render('games', { header: 'Games', gameName, games, groups, user: req.user });
		} catch (error) {
			console.log(error)
			if (error.name == "NOT_FOUND" && error.info.gameName) {
				res.render('error', { error, gameNameNotFound: gameName });
			}
			else {
				console.log(error);
				res.render('error', { error });
			}
		}
	}


	/**
	 * Shows the user groups.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function showUserGroups(req, res) {
		const token = getBearerToken(req);
		const userId = req.params.userId;

		try {
			const groups = await services.listUserGroups(token, userId);
			res.render('groups', { groups, user: req.user });
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Shows group details.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function showGroupDetails(req, res) {
		const token = getBearerToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;

		try {
			const group = await services.getGroupDetails(token, userId, groupId);
			group.id = groupId;

			res.render('groupDetails', { header: 'Group Details', group, user: req.user });
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Creates a group.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function createGroup(req, res) {
		const token = getBearerToken(req);
		const userId = req.params.userId;
		const groupName = req.body.groupName;
		const groupDescription = req.body.groupDescription;

		try {
			const group = await services.createGroup(token, userId, groupName, groupDescription);
			res.redirect(`/user/${userId}/groups/${group.id}`);
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Edits a group.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function editGroup(req, res) {
		const token = getBearerToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;
		const newGroupName = req.body.newGroupName;
		const newGroupDescription = req.body.newGroupDescription;

		try {
			await services.editGroup(token, userId, groupId, newGroupName, newGroupDescription);
			res.redirect(`/user/${userId}/groups/${groupId}`);
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Adds a game to a group.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function addGameToGroup(req, res) {
		const token = getBearerToken(req);
		const userId = req.params.userId;
		const groupId = req.params.groupId;
		const gameId = req.params.gameId;

		try {
			await services.addGameToGroup(token, userId, groupId, gameId);
			res.redirect(`/user/${userId}/groups/${groupId}`);
		} catch (error) {
			console.log(error);
			res.render('error', { error });
		}
	}


	/**
	 * Shows the register/login page.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function getRegisterLoginPage(req, res) {
		res.render('register_login');
	}


	/**
	 * Register and logins a new user.
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function registerUser(req, res) {
		const userName = req.body.userName;
		const userId = req.body.userId;
		const password = req.body.password;

		try {
			await services.createNewUser(userId, userName, password);
			doLogin(req, res);
		} catch (error) {
			if (error.name == 'ALREADY_EXISTS')
				res.render('register_login', { already_exists: error })
			else {
				console.log(error);
				res.render('error', { error });
			}
		}
	}


	/**
	 * Logins user
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function doLogin(req, res) {
		const userId = req.body.userId;
		const password = req.body.password;

		try {
			const user = await services.checkCredentials(userId, password);
			user.userId = userId;
			user.token = await services.getToken(userId);

			req.login(user, err => {
				if (err)
					console.log('LOGIN ERROR', err);

				res.redirect(`/`);
			});
		} catch (error) {

			if (error.name == 'UNAUTHENTICATED')
				res.render('register_login', { unauthenticated: error })
			else {
				console.log('LOGIN EXCEPTION', error);
				res.render('error', { error });
			}
		}
	}


	/**
	 * Logouts user
	 * @param {Object} req 
	 * @param {Object} res 
	 */
	async function doLogout(req, res) {
		req.logout();
		res.redirect('/');
	}


	const router = express.Router();
	router.use(express.urlencoded({ extended: true }));

	// Homepage
	router.get('/', getHomepage);

	// Search page
	router.get('/search', getSearchPage);


	// Show popular games
	router.get('/popularGames', showPopularGames);

	// Show games searched
	router.get('/games', showSearchedGames);

	// Show game details
	router.get('/games/:gameId', showGameDetails);


	// Show Register/Login page
	router.get('/auth', getRegisterLoginPage);

	// Register new user
	router.post('/register', registerUser);

	// Login
	router.post('/login', doLogin);

	// Register new user
	router.post('/logout', doLogout);


	// Show groups
	router.get('/user/:userId/groups', showUserGroups);

	// Create group
	router.post('/user/:userId/groups', createGroup);

	// Show group details
	router.get('/user/:userId/groups/:groupId', showGroupDetails);

	// Show group details
	router.post('/user/:userId/groups/:groupId', editGroup);

	// Adds a game to a group
	router.post('/user/:userId/groups/:groupId/games/:gameId', addGameToGroup);

	return router;
};
