'use strict';

const dataMem = require("../borga-data-mem.js");
const errors = require('../borga-errors.js');


const userId1 = "A48287"
const userName1 = "Nyck Brandon"
const groupName1 = "RPG Games"
const groupDescription1 = "This is a description"
const gameName1 = "Skyrim"
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
}

const ResetMem = () => dataMem.resetMem();
const CreateUser1 = () => dataMem.createNewUser(userId1, userName1);
const CreateGroup1 = () => dataMem.createGroup(userId1, groupName1, groupDescription1);


function assertThrowsNotFound(func, info) {
    expect(func)
    .toThrow(errors.NOT_FOUND(info));
}

function assertThrowsAlreadyExists(func, info) {
    expect(func)
    .toThrow(errors.ALREADY_EXISTS(info));
}


test("getPopularGames returns names of most popular games", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    dataMem.addGameToGroup(userId1, groupName1, game1)

    expect(dataMem.getPopularGames())
    .toEqual([gameName1]);
});


// ------------------------- Users Tests -------------------------


test("createNewUser creates user, returning id of the new user", () => {
    ResetMem();

    expect(dataMem.createNewUser(userId1, userName1))
    .toEqual(userId1);
});

test("createNewUser throws if user already exists", () => {
    ResetMem(), CreateUser1();

    assertThrowsAlreadyExists(() => dataMem.createNewUser(userId1, userName1), { userId: userId1 });
});

test("deleteUser deletes user, returning id of the deleted user", () => {
    ResetMem(), CreateUser1();

    expect(dataMem.deleteUser(userId1))
    .toEqual(userId1);

    assertThrowsNotFound(() => dataMem.getUser(userId1), { userId: userId1 });
});

test("deleteUser throws if the user already doesn't exist", () => {
    ResetMem();

    assertThrowsNotFound(() => dataMem.deleteUser(userId1), { userId: userId1 });
});

test("listUsers returns array containing all user objects", () => {
    ResetMem();

    dataMem.createNewUser("A48280", "Andre Jesus");
    dataMem.createNewUser("A48287", userName1);
    dataMem.createNewUser("A48309", "Andre Santos");

    expect(dataMem.listUsers())
    .toEqual([
        { name: "Andre Jesus", groups: {} },
        { name: userName1, groups: {} },
        { name: "Andre Santos", groups: {} }
    ]);
});


// ------------------------- Groups Tests -------------------------


test("createGroup returns name of the created group", () => {
    ResetMem(), CreateUser1();

    expect(dataMem.createGroup(userId1, groupName1, groupDescription1))
    .toEqual(groupName1);
});

test("createGroup throws if group already exists", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    assertThrowsAlreadyExists(() => dataMem.createGroup(userId1, groupName1, groupDescription1), { groupName: groupName1 });
});

test("editGroup edits a group, returning name of the edited group", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    const newGroupName = "FPS Games";
    const newDescription = "Another description";

    expect(dataMem.editGroup(userId1, groupName1, newGroupName, newDescription))
    .toEqual(newGroupName);

    expect(dataMem.getGroupFromUser(userId1, groupName1))
    .toEqual({
        name: newGroupName,
        description: newDescription,
        games: {}
    });
});

test("listUserGroups returns array containing all group objects", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    expect(dataMem.listUserGroups(userId1))
    .toEqual([groupObj1]);
});

test("deleteGroup deletes a group, returning name of the group", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    expect(dataMem.deleteGroup(userId1, groupName1))
    .toEqual(groupName1);

    assertThrowsNotFound(() => dataMem.getGroupFromUser(userId1, groupName1), { groupName: groupName1 });
});

test("deleteGroup throws if the group already doesn't exist", () => {
    ResetMem(), CreateUser1();

    assertThrowsNotFound(() => dataMem.deleteGroup(userId1, groupName1), { groupName: groupName1 });
});

test("getGroupDetails returns object containing the group details", () => {
    ResetMem();

    expect(dataMem.getGroupDetails({
        name: groupName1,
        description: groupDescription1,
        games: { gameName1: { name: gameName1 } }
    }))
    .toEqual({
        name: groupName1,
        description: groupDescription1,
        games: [gameName1]
    });
});


// ------------------------- Games Tests -------------------------


test("addGameToGroup adds game to a group, returning name of the added game", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    expect(dataMem.addGameToGroup(userId1, groupName1, game1))
    .toEqual(gameName1);

    expect(dataMem.getGameFromGroup(userId1, groupName1, gameName1))
    .toEqual(game1);
});

test("removeGameFromGroup removes game, returning name of the removed game", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    dataMem.addGameToGroup(userId1, groupName1, game1)

    expect(dataMem.removeGameFromGroup(userId1, groupName1, gameName1))
    .toEqual(gameName1);

    assertThrowsNotFound(() => dataMem.getGameFromGroup(userId1, groupName1, gameName1), { gameName: gameName1 });
});

test("removeGameFromGroup throws if the game already doesn't exist", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    assertThrowsNotFound(() => dataMem.removeGameFromGroup(userId1, groupName1, gameName1), { gameName: gameName1 });
});


// ------------------------- Utils Tests -------------------------


test("createUserObj creates an user object from a name", () => {
    ResetMem();

    expect(dataMem.createUserObj(userName1))
    .toEqual({
        name: userName1,
        groups: {}
    });
});

test("addUser creates an user given an id and an user object", () => {
    ResetMem();

    expect(dataMem.addUser(userId1, dataMem.createUserObj(userName1)))
    .toEqual(userId1);

    expect(dataMem.getUser(userId1))
    .toEqual({
        name: userName1,
        groups: {}
    });
});

test("createGroupObj creates a group object from a name and a description", () => {
    ResetMem();

    expect(dataMem.createGroupObj(groupName1, groupDescription1))
    .toEqual(groupObj1);
});

test("addGroupToUser adds a group to a user given a group object", () => {
    ResetMem(), CreateUser1();

    expect(dataMem.addGroupToUser(userId1, dataMem.createGroupObj(groupName1, groupDescription1)))
    .toEqual(groupName1);

    expect(dataMem.getGroupFromUser(userId1, groupName1))
    .toEqual(groupObj1);
});

test("getUser returns a user object", () => {
    ResetMem(), CreateUser1();

    expect(dataMem.getUser(userId1))
    .toEqual({
        name: userName1,
        groups: {}
    });
});

test("getUser throws if the user doesn't exist", () => {
    ResetMem();

    assertThrowsNotFound(() => dataMem.getUser(userId1), { userId: userId1 });
});

test("getGroupFromUser returns a group object from a user", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    expect(dataMem.getGroupFromUser(userId1, groupName1))
    .toEqual(groupObj1);
});

test("getGroupFromUser throws if the group doesn't exist", () => {
    ResetMem(), CreateUser1();

    assertThrowsNotFound(() => dataMem.getGroupFromUser(userId1, groupName1), { groupName: groupName1 });
});

test("getGameFromGroup returns a game object from a group", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    dataMem.addGameToGroup(userId1, groupName1, game1);

    expect(dataMem.getGameFromGroup(userId1, groupName1, gameName1))
    .toEqual(game1);
});

test("getGameFromGroup throws if the game doesn't exist", () => {
    ResetMem(), CreateUser1(), CreateGroup1();

    assertThrowsNotFound(() => dataMem.getGameFromGroup(userId1, groupName1, gameName1), { gameName: gameName1 });
});
