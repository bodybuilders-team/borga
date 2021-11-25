'use strict';


const errors = require('../borga-errors.js');

const servicesBuilder = require('../borga-services.js');
const dataMem = require('../borga-data-mem.js');
const mockDataExt = require('../__mock__/borga-mock-data-ext.js');

const defaultServices = servicesBuilder(mockDataExt, dataMem);


describe("Search tests", () => {
    test('Search game without param', async () => {
        const services = servicesBuilder();
        try {
            await services.searchGameByName();
        }
        catch (err) {
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from searchGameByName with no params");
    });


    test('Search for inexistent game', async () => {
        const services = servicesBuilder({
            searchGameByName: async () => {
                throw errors.NOT_FOUND("no game found");
            }
        });

        try {
            await services.searchGameByName('inexistent game');
        }
        catch (err) {
            expect(err.name).toEqual('NOT_FOUND');
            return;
        }
        throw new Error("shouldn't return from searchGameByName with inexistent game");
    });


    test('Search for existing game', async () => {
        const res = await defaultServices.searchGameByName('Catan');
        expect(res).toBeDefined();
        expect(res).toEqual(mockDataExt.games['OIXt3DmJU0']);
    });
});


test("getPopularGames returns names of most popular games", () => {
    expect(dataMem.getPopularGames())
        .toEqual([]);
});


describe("User groups operations", () => {
    test('Create new user without userId', async () => {
        try{
            await defaultServices.createNewUser(undefined, "username")
        }
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from createNewUser without userId");
    });

    test('Create new user with an Integer value in username', async () => {
        try{
            await defaultServices.createNewUser("userId", 20)
        }
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from createNewUser with an Integer value in username");
    });

    test('Create new group with an Integer value in groupName', async () => {
        try{
            await defaultServices.createGroup("", "20", "description")
        }
        catch(err){
            expect(err.name).toEqual('BAD_REQUEST');
            return;
        }
        throw new Error("shouldn't return from createGroup with an Integer value in groupName");
    });

});

