'use strict';

const dataMem = require("../borga-data-mem.js");
const errors = require('../borga-errors.js');


test("getPopularGames returns names of most popular games", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    const game = {
        id: "I9azM1kA6l",
        name: "Skyrim",
        url: "games.net/skyrim",
        image: "skyrim.jpg",
        publisher: "Bethesda Game Studios",
        amazon_rank: 1,
        price: 420.69
    };
    dataMem.addGameToGroup(userId, groupName, game)

    expect(dataMem.getPopularGames())
    .toEqual([game.name]);
});


// ------------------------- Users Tests -------------------------


test("createNewUser creates user, returning id of the new user", () => {
    dataMem.resetMem();

    const userId = "A48287";
    expect(dataMem.createNewUser(userId, "Nyck Brandon"))
    .toEqual(userId);
});

test("createNewUser throws if user already exists", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    expect(() => dataMem.createNewUser(userId, "Nyck Brandon"))
    .toThrow(errors.ALREADY_EXISTS({ userId }));
});

test("deleteUser deletes user, returning id of the deleted user", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    expect(dataMem.deleteUser(userId))
    .toEqual(userId);

    expect(dataMem.getUser(userId))
    .toBeTruthy()
});

test("deleteUser throws if the user already doesn't exist", () => {
    dataMem.resetMem();

    const userId = "A48287";

    expect(() => dataMem.deleteUser(userId))
    .toThrow(errors.NOT_FOUND({ userId }));
});

test("listUsers returns array containing all user objects", () => {
    dataMem.resetMem();

    dataMem.createNewUser("48280", "Andre Jesus");
    dataMem.createNewUser("48287", "Nyck Brandon");
    dataMem.createNewUser("48309", "Andre Santos");

    expect(dataMem.listUsers())
    .toEqual([
        { name: "Andre Jesus", groups: {} },
        { name: "Nyck Brandon", groups: {} },
        { name: "Andre Santos", groups: {} }
    ]);
});


// ------------------------- Groups Tests -------------------------


test("createGroup returns name of the created group", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");


    const groupName = "RPG Games";
    expect(dataMem.createGroup(userId, groupName, "This is a description"))
    .toEqual(groupName);
});

test("createGroup throws if group already exists", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    expect(() => dataMem.createGroup(userId, groupName, "This is a description"))
    .toThrow(errors.ALREADY_EXISTS({ groupName }));
});

test("editGroup edits a group, returning name of the edited group", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    const newGroupName = "FPS Games";
    const newDescription = "Another description";
    expect(dataMem.editGroup(userId, groupName, newGroupName, newDescription))
    .toEqual(newGroupName);

    expect(dataMem.getGroupFromUser(userId, groupName))
    .toEqual({
        name: newGroupName,
        description: newDescription,
        games: {}
    });
});

test("listUserGroups returns array containing all group objects", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    const description = "This is a description";
    dataMem.createGroup(userId, groupName, "This is a description");

    expect(dataMem.listUserGroups(userId))
    .toEqual([
        { name : groupName, description: description, games: {} }
    ]);
});

test("deleteGroup deletes a group, returning name of the group", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    expect(dataMem.deleteGroup(userId, groupName))
    .toEqual(groupName);

    expect(() => dataMem.getGroupFromUser(userId, groupName))
    .toThrow(errors.NOT_FOUND({ groupName }));
});

test("deleteGroup throws if the group already doesn't exist", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";

    expect(() => dataMem.deleteGroup(userId, groupName))
    .toThrow(errors.NOT_FOUND({ groupName }));
});

test("getGroupDetails returns object containing the group details", () => {
    dataMem.resetMem();

    expect(dataMem.getGroupDetails({
        name: "RPG Games",
        description: "This is the description of RPG Games",
        games: { Skyrim: { name: "Skyrim" } }
    }))
    .toEqual({
        name: "RPG Games",
        description: "This is the description of RPG Games",
        games: ["Skyrim"]
    });
});


// ------------------------- Games Tests -------------------------


test("addGameToGroup adds game to a group, returning name of the added game", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    const gameName = "Skyrim";
    const game = {
        id: "I9azM1kA6l",
        name: gameName,
        url: "games.net/skyrim",
        image: "skyrim.jpg",
        publisher: "Bethesda Game Studios",
        amazon_rank: 1,
        price: 420.69
    };

    expect(dataMem.addGameToGroup(userId, groupName, game))
    .toEqual(gameName);

    expect(dataMem.getGameFromGroup(userId, groupName, gameName))
    .toEqual(game);
});

test("removeGameFromGroup removes game, returning name of the removed game", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    const gameName = "Skyrim"

    const game = {
        id: "I9azM1kA6l",
        name: gameName,
        url: "games.net/skyrim",
        image: "skyrim.jpg",
        publisher: "Bethesda Game Studios",
        amazon_rank: 1,
        price: 420.69
    };
    dataMem.addGameToGroup(userId, groupName, game)

    expect(dataMem.removeGameFromGroup(userId, groupName, gameName))
    .toEqual(gameName);

    expect(() => dataMem.getGameFromGroup(userId, groupName, gameName))
    .toThrow(errors.NOT_FOUND({ gameName }));
});

test("removeGameFromGroup throws if the game already doesn't exist", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");
    
    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    const gameName = "Skyrim";

    expect(() => dataMem.removeGameFromGroup(userId, groupName, gameName))
    .toThrow(errors.NOT_FOUND({ gameName }));
});


// ------------------------- Utils Tests -------------------------


test("createUserObj creates an user object from a name", () => {
    dataMem.resetMem();

    const userName = "Nyck Brandon";

    expect(dataMem.createUserObj(userName))
    .toEqual({
        name: userName,
        groups: {}
    });
});

test("addUser creates an user given an id and an user object", () => {
    dataMem.resetMem();

    const userId = "A48287";
    const userName = "Nyck Brandon";

    expect(dataMem.addUser(userId, dataMem.createUserObj(userName)))
    .toEqual(userId);

    expect(dataMem.getUser(userId))
    .toEqual({
        name: userName,
        groups: {}
    });
});

test("createGroupObj creates a group object from a name and a description", () => {
    dataMem.resetMem();

    const groupName = "RPG Games";
    const groupDescription = "This is a description";

    expect(dataMem.createGroupObj(groupName, groupDescription))
    .toEqual({
        name: groupName,
        description: groupDescription,
        games: {}
    });
});

test("addGroupToUser adds a group to a user given a group object", () => {
    dataMem.resetMem();

    const userId = "A48287";
    const userName = "Nyck Brandon";
    dataMem.createNewUser(userId, userName)


    const groupName = "RPG Games";
    const groupDescription = "This is a description";

    expect(dataMem.addGroupToUser(userId, dataMem.createGroupObj(groupName, groupDescription)))
    .toEqual(groupName);

    expect(dataMem.getGroupFromUser(userId, groupName))
    .toEqual({
        name: groupName,
        description: groupDescription,
        games: {}
    });
});

test("getUser returns a user object", () => {
    dataMem.resetMem();

    const userId = "A48287";
    const userName = "Nyck Brandon";
    dataMem.createNewUser(userId, userName)


    expect(dataMem.getUser(userId))
    .toEqual({
        name: userName,
        groups: {}
    });
});

test("getUser throws if the user doesn't exist", () => {
    dataMem.resetMem();

    const userId = "A48287";

    expect(() => dataMem.getUser(userId))
    .toThrow(errors.NOT_FOUND({ userId }));
});

test("getGroupFromUser returns a group object from a user", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    const groupName = "RPG Games";
    const groupDescription = "This is a description"
    dataMem.createGroup(userId, groupName, groupDescription);

    expect(dataMem.getGroupFromUser(userId, groupName))
    .toEqual({
        name: groupName,
        description: groupDescription,
        games: {}
    });
});

test("getGroupFromUser throws if the group doesn't exist", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    const groupName = "RPG Games";

    expect(() => dataMem.getGroupFromUser(userId, groupName))
    .toThrow(errors.NOT_FOUND({ groupName }));
});

test("getGameFromGroup returns a game object from a group", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");
    
    const gameName = "Skyrim";
    const game = {
        id: "I9azM1kA6l",
        name: gameName,
        url: "games.net/skyrim",
        image: "skyrim.jpg",
        publisher: "Bethesda Game Studios",
        amazon_rank: 1,
        price: 420.69
    };

    dataMem.addGameToGroup(userId, groupName, game);

    expect(dataMem.getGameFromGroup(userId, groupName, gameName))
    .toEqual(game);
});

test("getGameFromGroup throws if the game doesn't exist", () => {
    dataMem.resetMem();

    const userId = "A48287";
    dataMem.createNewUser(userId, "Nyck Brandon");

    const groupName = "RPG Games";
    dataMem.createGroup(userId, groupName, "This is a description");

    const gameName = "Skyrim";

    expect(() => dataMem.getGameFromGroup(userId, groupName, gameName))
    .toThrow(errors.NOT_FOUND({ gameName }));
});
