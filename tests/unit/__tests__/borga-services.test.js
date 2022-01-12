'use strict';


const config = require('../../../borga-config');
const errors = require('../../../borga-errors.js');

const test_user = config.guest;

const mockDataExt = require('../__mock__/borga-mock-data-ext.js');
const dataMem = require('../../../borga-data-mem.js')(test_user);
const servicesBuilder = require('../../../borga-services.js');

const defaultServices = servicesBuilder(mockDataExt, dataMem);

// ----------------------------- Constants used in tests -----------------------------
const userId1 = "a48309";
const token1 = '5d389af1-06db-4401-8aef-36d8d6428f31';
const groupName1 = "Negotiation Games";
const groupDescription1 = "This is a description";
const gameId1 = "I9azM1kA6l";
const gameName1 = "Monopoly Skyrim";
const groupId1 = "NegG";
const groupObj1 = {
	name: groupName1,
	description: groupDescription1,
	games: {}
};


/**
 * Resets all users groups by assigning {} to the object groups of each user.
 */
const resetAllGroups = async () => dataMem.resetAllGroups();

/**
 * Creates a new group with the information of the tests constants.
 */
const CreateGroup1 = async () => dataMem.createGroup(userId1, groupId1, groupName1, groupDescription1);


//-- Search tests --
describe("Search tests", () => {
	test('Search games without gameName param', async () => {
		const services = {
			searchGamesByName: async () => {
				throw errors.NOT_FOUND("No gameName parameter");
			}
		};

		try {
			await services.searchGamesByName();
		}
		catch (err) {
			expect(err.name).toEqual('NOT_FOUND');
			return;
		}
		throw new Error("shouldn't return from searchGamesByName with no params");
	});


	test('Search for inexistent game', async () => {
		const services = {
			searchGamesByName: async (gameName) => {
				throw errors.NOT_FOUND({ gameName });
			}
		};

		try {
			await services.searchGamesByName('inexistent game');
		}
		catch (err) {
			expect(err.name).toEqual('NOT_FOUND');
			return;
		}
		throw new Error("shouldn't return from searchGamesByName with inexistent game");
	});


	test('Search for existing game', async () => {
		const games = await defaultServices.searchGamesByName(gameName1);
		expect(games).toBeDefined();
		expect(games[0]).toEqual(mockDataExt.games[gameId1]);
	});
});


test("getPopularGames returns names of most popular games", async() => {
	expect(await mockDataExt.getPopularGames())
		.toEqual([
			{ id: "TAAifFP590", name: "Root" },
			{ id: "yqR4PtpO8X", name: "Scythe" },
			{ id: "5H5JS0KLzK", name: "Wingspan" },
			{ id: "RLlDWHh7hR", name: "Gloomhaven" },
			{ id: "fDn9rQjH9O", name: "Terraforming Mars" },
			{ id: "i5Oqu5VZgP", name: "Azul" },
			{ id: "7NYbgH2Z2I", name: "Viticulture: Essential Edition" },
			{ id: "6FmFeux5xH", name: "Pandemic" },
			{ id: "kPDxpJZ8PD", name: "Spirit Island" },
			{ id: "j8LdPFmePE", name: "7 Wonders Duel" },
			{ id: "OF145SrX44", name: "7 Wonders" },
			{ id: "GP7Y2xOUzj", name: "Codenames" },
			{ id: "VNBC6yq1WO", name: "The Castles of Burgundy" },
			{ id: "oGVgRSAKwX", name: "Carcassonne" },
			{ id: "O0G8z5Wgz1", name: "Splendor" },
			{ id: "mce5HZPnF5", name: "Pandemic Legacy: Season 1" },
			{ id: "FCuXPSfhDR", name: "Concordia" },
			{ id: "8xos44jY7Q", name: "Everdell" },
			{ id: "AuBvbISHR6", name: "Ticket to Ride" },
			{ id: "3IPVIROfvl", name: "Brass: Birmingham" }
		]);
});


//-- User tests --
describe("User tests", () => {
	test('Create new user without userId', async () => {
		try {
			await defaultServices.createNewUser(undefined, "username");
		}
		catch (err) {
			expect(err.name).toEqual('BAD_REQUEST');
			return;
		}
		throw new Error("shouldn't return from createNewUser without userId");
	});

	test('Create new user with an Integer value in username', async () => {
		try {
			await defaultServices.createNewUser("userId", 20);
		}
		catch (err) {
			expect(err.name).toEqual('BAD_REQUEST');
			return;
		}
		throw new Error("shouldn't return from createNewUser with an Integer value in username");
	});

	test('Create new user with not lowercase userId', async () => {
		try {
			const res = await defaultServices.createNewUser("ProfID", "Paulão");
		}
		catch (err) {
			expect(err.name).toEqual('BAD_REQUEST');
			return;
		}
		throw new Error("shouldn't return from createNewUser with a not lowercase userId");
	});

	test('Create valid new user ', async () => {
		const res = await defaultServices.createNewUser("profid", "Paulão", "1234");
		expect(res).toBeDefined();
		expect(res.userId).toEqual("profid");
		expect(res.userName).toEqual("Paulão");
	});
});


//-- Create User groups tests--
describe("Create User groups tests", () => {
	beforeEach(async () =>
		await resetAllGroups()
	);

	test('Create new group with an Integer value in groupName', async () => {
		try {
			await defaultServices.createGroup(userId1, token1, 20, groupDescription1);
		}
		catch (err) {
			expect(err.name).toEqual('BAD_REQUEST');
			return;
		}
		throw new Error("shouldn't return from createGroup with an Integer value in groupName");
	});


	test('Create valid new group', async () => {
		const res = await defaultServices.createGroup(token1, userId1, groupName1, groupDescription1);
		expect(res).toBeDefined();
		expect(res).toEqual({
			id: res.id,
			name: groupName1,
			description: groupDescription1
		});
	});
});


//-- User groups operations tests --
describe("User groups operations tests", () => {
	beforeEach(async () =>
		await resetAllGroups().then(CreateGroup1())
	);

	test('Edit group with an Integer value in newGroupName', async () => {
		try {
			await defaultServices.editGroup(token1, userId1, groupId1, 12, groupDescription1);
		}
		catch (err) {
			expect(err.name).toEqual('BAD_REQUEST');
			return;
		}
		throw new Error("shouldn't return from editGroup with an Integer value in groupName");
	});

	test('Edit group with valid parameters', async () => {
		const res = await defaultServices.editGroup(token1, userId1, groupId1, "Paulão games", groupDescription1);
		expect(res).toBeDefined();
		expect(res).toEqual({
			id: groupId1,
			name: "Paulão games",
			description: groupDescription1
		});
	});

	test('List groups with valid parameters', async () => {
		const res = await defaultServices.listUserGroups(token1, userId1);
		expect(res).toBeDefined();
		expect(res[groupId1]).toEqual({
			name: groupObj1.name,
			description: groupObj1.description
		});
	});

	test('Delete group with valid parameters', async () => {
		const res = await defaultServices.deleteGroup(token1, userId1, groupId1);
		expect(res).toBeDefined();
		expect(res).toEqual({
			id: groupId1,
			name: groupName1,
			description: groupDescription1,
		});
	});

	test('Get group details with valid parameters', async () => {
		const res = await defaultServices.getGroupDetails(token1, userId1, groupId1);
		expect(res).toBeDefined();
		expect(res).toEqual({
			id: groupId1,
			name: groupObj1.name,
			description: groupObj1.description,
			games: groupObj1.games
		});
	});

	test('Add game to group with valid parameters', async () => {
		const res = await defaultServices.addGameToGroup(token1, userId1, groupId1, gameId1);
		expect(res).toBeDefined();
		expect(res).toEqual(mockDataExt.games[gameId1]);
	});

	test('Remove game from group with valid parameters', async () => {
		await defaultServices.addGameToGroup(token1, userId1, groupId1, gameId1);
		const res = await defaultServices.removeGameFromGroup(token1, userId1, groupId1, gameId1);
		expect(res).toBeDefined();
		expect(res).toEqual(mockDataExt.games[gameId1]);
	});
});
