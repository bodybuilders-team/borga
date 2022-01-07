'use strict';


const config = require('../../../borga-config');
const errors = require('../../../borga-errors.js');

const test_user = config.guest;

const dataMem = require("../../../borga-data-mem.js")(test_user);


// ----------------------------- Constants used in tests -----------------------------
const userId1 = "123456";
const userId2 = "a48309";
const token1 = '5d389af1-06db-4401-8aef-36d8d6428f31';
const userName1 = "Paulão";
const groupName1 = "Paulão Games";
const groupDescription1 = "This is a description";
const gameId1 = "I9azM1kA6l";
const gameName1 = "Monopoly Skyrim";
const game1 = {
	id: gameId1,
	name: gameName1,
	url: "games.net/skyrim",
	image: "skyrim.jpg",
	publisher: "Bethesda Game Studios",
	amazon_rank: 1,
	price: 420.69
};
const groupId1 = "PG";
const groupObj1 = {
	name: groupName1,
	description: groupDescription1,
	games: {}
};

/**
 * Resets memory by assigning {} to the object users and the object tokens.
 */
const ResetMem = async () => dataMem.resetMem();

/**
 * Creates a new user with the information of the tests constants.
 */
const CreateUser1 = async () => dataMem.createNewUser(userId1, userName1);

/**
 * Creates a new group with the information of the tests constants.
 */
const CreateGroup1 = async () => dataMem.createGroup(userId1, groupId1, groupName1, groupDescription1);


/**
 * Asserts that the function throws NOT_FOUND error.
 * @param {Function} func 
 * @param {Object} info 
 */
function assertThrowsNotFound(func, info) {
	expect(func)
		.toThrow(errors.NOT_FOUND(info));
}

/**
 * Asserts that the function throws ALREADY_EXISTS error.
 * @param {Function} func 
 * @param {Object} info 
 */
function assertThrowsAlreadyExists(func, info) {
	expect(func)
		.toThrow(errors.ALREADY_EXISTS(info));
}


describe("Token tests", () => {
	test("tokenToUserId returns correct userId", () => {
		expect(dataMem.tokenToUserId(token1)).toEqual(userId2);
	});

	test("tokenToUserId returns no userID when token does not exist", () => {
		expect(dataMem.tokenToUserId("")).toEqual(undefined);
	});
});


describe("User tests", () => {
	beforeEach(async () =>
		await ResetMem().then(CreateUser1())
	);

	test("createUserObj creates an user object from a name", () => {
		expect(dataMem.createUserObj(userName1))
			.toEqual({
				name: userName1,
				groups: {}
			});
	});

	test("createNewUser creates an user, returning id of the new user", () => {
		const createdUser = dataMem.createNewUser("1234567", userName1);

		expect(createdUser.userId).toEqual("1234567");
		expect(createdUser.userName).toEqual(userName1);
	});

	test("getUser throws if the user doesn't exist", () => {
		assertThrowsNotFound(() => dataMem.getUser("undefined"), { userId: "undefined" });
	});

	test("createNewUser throws if user already exists", () => {
		assertThrowsAlreadyExists(() => dataMem.createNewUser(userId1, userName1), { userId: userId1 });
	});
});


describe("Group tests", () => {
	beforeEach(async () =>
		await ResetMem().then(CreateUser1()).then(CreateGroup1())
	);

	test("getGroupDetails returns object containing the group details including game ids", () => {
		expect(dataMem.getGroupDetails(userId1, groupId1))
			.toEqual({
				id: groupId1,
				name: groupName1,
				description: groupDescription1,
				games: {}
			});
	});

	test("createGroupObj creates a group object given a name and a description", () => {
		expect(dataMem.createGroupObj(groupName1, groupDescription1))
			.toEqual(groupObj1);
	});

	test("createGroup returns the name of the created group", () => {
		expect(dataMem.createGroup(userId1, "ABC", groupName1, groupDescription1))
			.toEqual({
				id: "ABC",
				name: groupName1,
				description: groupDescription1
			});
	});

	test("editGroup edits a group, returning name of the edited group", () => {
		const newGroupName = "FPS Games";
		const newGroupDescription = "Another description";

		expect(dataMem.editGroup(userId1, groupId1, newGroupName, newGroupDescription))
			.toEqual({
				id: groupId1,
				name: newGroupName,
				description: newGroupDescription
			});

		expect(dataMem.getGroupFromUser(userId1, groupId1))
			.toEqual({
				name: newGroupName,
				description: newGroupDescription,
				games: {}
			});
	});

	test("listUserGroups returns an array containing all group objects", () => {
		expect(dataMem.listUserGroups(userId1))
			.toEqual({
				[groupId1]: {
					name: groupObj1.name,
					description: groupObj1.description
				}
			});
	});

	test("deleteGroup deletes a group, returning name of the group", () => {
		expect(dataMem.deleteGroup(userId1, groupId1))
			.toEqual({
				id: groupId1,
				name: groupName1,
				description: groupDescription1
			});

		assertThrowsNotFound(() => dataMem.getGroupFromUser(userId1, groupId1), { groupId: groupId1 });
	});

	test("deleteGroup throws if the group already doesn't exist", () => {
		assertThrowsNotFound(() => dataMem.deleteGroup(userId1, "undefined"), { groupId: "undefined" });
	});
});


describe("Game tests", () => {
	beforeEach(async () =>
		await ResetMem().then(CreateUser1()).then(CreateGroup1())
	);

	test("addGameToGroup adds a game to a group, returning the name of the added game", () => {
		expect(dataMem.addGameToGroup(userId1, groupId1, game1))
			.toEqual(game1);

		expect(dataMem.getGameFromGroup(userId1, groupId1, gameId1))
			.toEqual(game1);
	});

	test("removeGameFromGroup removes game, returning name of the removed game", () => {
		dataMem.addGameToGroup(userId1, groupId1, game1)

		expect(dataMem.removeGameFromGroup(userId1, groupId1, gameId1))
			.toEqual(game1);

		assertThrowsNotFound(() => dataMem.getGameFromGroup(userId1, groupId1, gameId1), { gameId: gameId1 });
	});

	test("removeGameFromGroup throws if the game already doesn't exist", () => {
		assertThrowsNotFound(() => dataMem.removeGameFromGroup(userId1, groupId1, gameId1), { gameId: gameId1 });
	});

});


describe('Utils tests', () => {
	beforeEach(async () =>
		await ResetMem().then(CreateUser1()).then(CreateGroup1())
	);

	test("getUser returns a user object", () => {
		expect(dataMem.getUser(userId1))
			.toEqual({
				name: userName1,
				groups: { [groupId1]: groupObj1 }
			});
	});

	test("getGroupFromUser returns a group object from an user", () => {
		expect(dataMem.getGroupFromUser(userId1, groupId1))
			.toEqual(groupObj1);
	});

	test("getGroupFromUser throws if the group doesn't exist", () => {
		assertThrowsNotFound(() => dataMem.getGroupFromUser(userId1, "undefined"), { groupId: "undefined" });
	});

	test("getGameFromGroup returns a game object from a group", () => {
		dataMem.addGameToGroup(userId1, groupId1, game1);
		expect(dataMem.getGameFromGroup(userId1, groupId1, gameId1))
			.toEqual(game1);
	});

	test("getGameFromGroup throws if the game doesn't exist", () => {
		assertThrowsNotFound(() => dataMem.getGameFromGroup(userId1, groupId1, gameId1), { gameId: gameId1 });
	});
});
