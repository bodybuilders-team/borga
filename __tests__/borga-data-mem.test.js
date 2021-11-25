'use strict';


const dataMem = require("../borga-data-mem.js");
const errors = require('../borga-errors.js');


// ----------------------------- Constants used in tests -----------------------------
const userId1 = "123456";
const userName1 = "Paulão";
const groupName1 = "RPG Games";
const groupDescription1 = "This is a description";
const gameName1 = "Skyrim";
const game1 = {
    id: "I9azM1kA6l",
    name: gameName1,
    url: "games.net/skyrim",
    image: "skyrim.jpg",
    publisher: "Bethesda Game Studios",
    amazon_rank: 1,
    price: 420.69
};
const groupObj1 = {
    name: groupName1,
    description: groupDescription1,
    games: {}
};

/**
 * Resets memory by assigning {} to the object users.
 */
const ResetMem = async () => dataMem.resetMem();

/**
 * Creates a new user with the information of the tests constants.
 */
const CreateUser1 = async () => dataMem.createNewUser(userId1, userName1);

/**
 * Creates a new group with the information of the tests constants.
 */
const CreateGroup1 = async () => dataMem.createGroup(userId1, groupName1, groupDescription1);


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

    test("createNewUser creates user, returning id of the new user", () => {
        const createdUser = dataMem.createNewUser("1234567", userName1);

        expect(createdUser.userId).toEqual("1234567");
        expect(createdUser.userName).toEqual(userName1);
    });

    test("deleteUser throws if the user already doesn't exist", () => {
        assertThrowsNotFound(() => dataMem.deleteUser("undefined"), { userId: "undefined" });
    });

    test("getUser throws if the user doesn't exist", () => {
        assertThrowsNotFound(() => dataMem.getUser("undefined"), { userId: "undefined" });
    });

    test("createNewUser throws if user already exists", () => {
        assertThrowsAlreadyExists(() => dataMem.createNewUser(userId1, userName1), { userId: userId1 });
    });

    test("deleteUser deletes user, returning id of the deleted user", () => {
        expect(dataMem.deleteUser(userId1))
            .toEqual(userId1);

        assertThrowsNotFound(() => dataMem.getUser(userId1), { userId: userId1 });
    });

    test("listUsers returns array containing all user objects", () => {
        dataMem.createNewUser("A48280", "Andre Jesus");
        dataMem.createNewUser("A48287", "Nyckollas Brandão");
        dataMem.createNewUser("A48309", "Andre Santos");

        expect(dataMem.listUsers())
            .toEqual([
                { name: "Paulão", groups: {} },
                { name: "Andre Jesus", groups: {} },
                { name: "Nyckollas Brandão", groups: {} },
                { name: "Andre Santos", groups: {} }
            ]);
    });
});


describe("Group tests", () => {
    beforeEach(async () =>
        await ResetMem().then(CreateUser1()).then(CreateGroup1())
    );

    test("getGroupDetails returns object containing the group details", () => {
        expect(dataMem.getGroupDetails({
            name: groupName1,
            description: groupDescription1,
            games: { [gameName1]: game1.id }
        }))
            .toEqual({
                name: groupName1,
                description: groupDescription1,
                games: [gameName1]
            });
    });

    test("createGroupObj creates a group object from a name and a description", () => {
        expect(dataMem.createGroupObj(groupName1, groupDescription1))
            .toEqual(groupObj1);
    });

    test("createGroup returns name of the created group", () => {
        expect(dataMem.createGroup(userId1, "New group", groupDescription1))
            .toEqual("New group");
    });

    test("createGroup throws if group already exists", () => {
        assertThrowsAlreadyExists(() => dataMem.createGroup(userId1, groupName1, groupDescription1), { groupName: groupName1 });
    });

    test("editGroup edits a group, returning name of the edited group", () => {
        const newGroupName = "FPS Games";
        const newDescription = "Another description";

        expect(dataMem.editGroup(userId1, groupName1, newGroupName, newDescription))
            .toEqual(newGroupName);

        expect(dataMem.getGroupFromUser(userId1, newGroupName))
            .toEqual({
                name: newGroupName,
                description: newDescription,
                games: {}
            });
    });

    test("listUserGroups returns array containing all group objects", () => {
        expect(dataMem.listUserGroups(userId1))
            .toEqual({ [groupName1]: groupObj1 });
    });

    test("deleteGroup deletes a group, returning name of the group", () => {
        expect(dataMem.deleteGroup(userId1, groupName1))
            .toEqual(groupName1);

        assertThrowsNotFound(() => dataMem.getGroupFromUser(userId1, groupName1), { groupName: groupName1 });
    });

    test("deleteGroup throws if the group already doesn't exist", () => {
        assertThrowsNotFound(() => dataMem.deleteGroup(userId1, "undefined"), { groupName: "undefined" });
    });

    test("addGroupToUser adds a group to a user given a group object", () => {
        expect(dataMem.addGroupToUser(userId1, dataMem.createGroupObj(groupName1, groupDescription1)))
            .toEqual(groupName1);

        expect(dataMem.getGroupFromUser(userId1, groupName1))
            .toEqual(groupObj1);
    });

});


describe("Game tests", () => {
    beforeEach(async () =>
        await ResetMem().then(CreateUser1()).then(CreateGroup1())
    );

    test("getPopularGames returns names of most popular games", () => {
        dataMem.addGameToGroup(userId1, groupName1, game1)

        expect(dataMem.getPopularGames())
            .toEqual([gameName1]);
    });

    test("addGameToGroup adds game to a group, returning name of the added game", () => {
        expect(dataMem.addGameToGroup(userId1, groupName1, game1))
            .toEqual(gameName1);

        expect(dataMem.getGameFromGroup(userId1, groupName1, gameName1))
            .toEqual(game1);
    });

    test("removeGameFromGroup removes game, returning name of the removed game", () => {
        dataMem.addGameToGroup(userId1, groupName1, game1)

        expect(dataMem.removeGameFromGroup(userId1, groupName1, gameName1))
            .toEqual(gameName1);

        assertThrowsNotFound(() => dataMem.getGameFromGroup(userId1, groupName1, gameName1), { gameName: gameName1 });
    });

    test("removeGameFromGroup throws if the game already doesn't exist", () => {
        assertThrowsNotFound(() => dataMem.removeGameFromGroup(userId1, groupName1, gameName1), { gameName: gameName1 });
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
                groups: { [groupName1] : groupObj1 }
            });
    });

    test("getGroupFromUser returns a group object from a user", () => {
        expect(dataMem.getGroupFromUser(userId1, groupName1))
            .toEqual(groupObj1);
    });

    test("getGroupFromUser throws if the group doesn't exist", () => {
        assertThrowsNotFound(() => dataMem.getGroupFromUser(userId1, "undefined"), { groupName: "undefined" });
    });

    test("getGameFromGroup returns a game object from a group", () => {
        dataMem.addGameToGroup(userId1, groupName1, game1);
        expect(dataMem.getGameFromGroup(userId1, groupName1, gameName1))
            .toEqual(game1);
    });

    test("getGameFromGroup throws if the game doesn't exist", () => {
        assertThrowsNotFound(() => dataMem.getGameFromGroup(userId1, groupName1, gameName1), { gameName: gameName1 });
    });
});
