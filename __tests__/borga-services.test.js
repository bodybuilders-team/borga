'use strict';


const errors = require('../borga-errors.js');

const servicesBuilder = require('../borga-services.js');
const dataMem = require('../borga-data-mem.js');
const mockDataExt = require('../__mock__/borga-mock-data-ext.js');

const defaultServices = servicesBuilder(mockDataExt, dataMem);

// ----------------------------- Constants used in tests -----------------------------
const userId1 = "A48309";
const token1 = '5d389af1-06db-4401-8aef-36d8d6428f31';
const groupName1 = "RPG Games";
const groupDescription1 = "This is a description";
const gameName1 = "Skyrim";
const groupObj1 = {
    name: groupName1,
    description: groupDescription1,
    games: {}
};

/**
 * Resets memory by assigning {} to the object users.
 */
const resetAllGroups = async () => dataMem.resetAllGroups();

/**
 * Creates a new group with the information of the tests constants.
 */
 const CreateGroup1 = async () => dataMem.createGroup(userId1, groupName1, groupDescription1);


//-- Search tests --
describe("Search tests", () => {
    test('Search games without gameName param', async () => {
        const services = servicesBuilder({
            searchGamesByName: async () => {
                throw errors.NOT_FOUND("No gameName parameter");
            }
        });

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
        const services = servicesBuilder({
            searchGamesByName: async (gameName) => {
                throw errors.NOT_FOUND({ gameName });
            }
        });

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
        const res = await defaultServices.searchGamesByName('Catan');
        expect(res).toBeDefined();
        expect(res).toEqual(mockDataExt.games['OIXt3DmJU0']);
    });
});


test("getPopularGames returns names of most popular games", () => {
    expect(dataMem.getPopularGames())
        .toEqual([]);
});


//-- User tests --
describe("User tests", () => {
    test('Create new user without userId', async () => {
        try{
            await defaultServices.createNewUser(undefined, "username");
        }
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from createNewUser without userId");
    });

    test('Create new user with an Integer value in username', async () => {
        try{
            await defaultServices.createNewUser("userId", 20);
        }
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from createNewUser with an Integer value in username");
    });

    test('Create valid new user ', async () => {
        const res = await defaultServices.createNewUser("ProfID", "Paulão");
        expect(res).toBeDefined();
        expect(res.userId).toEqual("ProfID");
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
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from createGroup with an Integer value in groupName");
    });

    
    test('Create valid new group', async () => {
        const res = await defaultServices.createGroup(userId1, token1, groupName1, groupDescription1);
        expect(res).toBeDefined();
        expect(res).toEqual(groupName1);
    });
});


//-- User groups operations tests --
describe("User groups operations tests", () => {
    beforeEach(async () =>
        await resetAllGroups().then(CreateGroup1())
    );

    test('Edit group with an Integer value in groupName', async () => {
        try{
            await defaultServices.editGroup(userId1, token1, groupName1, 12, groupDescription1);
        }
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from editGroup with an Integer value in groupName");
    });

    test('Edit group with valid parameters', async () => {
        const res = await defaultServices.editGroup(userId1, token1, groupName1, "Paulão games", groupDescription1);
        expect(res).toBeDefined();
        expect(res).toEqual("Paulão games");
    });

    test('List groups with valid parameters', async () => {
        const res = await defaultServices.listUserGroups(userId1, token1);
        expect(res).toBeDefined();
        expect(res[groupName1]).toEqual(groupObj1);
    });

    test('Delete groups with valid parameters', async () => {
        const res = await defaultServices.deleteGroup(userId1, token1, groupName1);
        expect(res).toBeDefined();
        expect(res).toEqual(groupName1);
    });

    test('Get group details with valid parameters', async () => {
        const res = await defaultServices.getGroupDetails(userId1, token1, groupName1);
        expect(res).toBeDefined();
        expect(res).toEqual({
            name: groupName1,
            description: groupDescription1,
            games: []
        });
    });

    test('Add game to group with valid parameters', async () => {
        const res = await defaultServices.addGameToGroup(userId1, token1, groupName1, gameName1);
        expect(res).toBeDefined();
        expect(res).toEqual(gameName1);
    });

    test('Remove game from group with valid parameters', async () => {
        await defaultServices.addGameToGroup(userId1, token1, groupName1, gameName1);
        const res = await defaultServices.removeGameFromGroup(userId1, token1, groupName1, gameName1);
        expect(res).toBeDefined();
        expect(res).toEqual(gameName1);
    });
});
