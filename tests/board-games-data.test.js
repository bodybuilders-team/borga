'use strict';

const gamesData = require("../board-games-data.js")
const errors = require('../borga-errors.js');


test("getStatusClass returns correct class from a status", () => {
    expect(gamesData.getStatusClass(504))
    .toStrictEqual(5)
})

test("makeGameObj returns a game obj created from another object", () => {
    expect(gamesData.makeGameObj(
        {
            id: "I9azM1kA6l",
            name: "Skyrim",
            url: "games.net/skyrim",
            image_url: "skyrim.jpg",
            publisher: "Bethesda Game Studios",
            amazon_rank: 1,
            price: 420.69,
            min_age: 8,
            discount: 0,
            mentions: 1000
        }
    ))
    .toStrictEqual(
        {
            id: "I9azM1kA6l",
            name: "Skyrim",
            url: "games.net/skyrim",
            image: "skyrim.jpg",
            publisher: "Bethesda Game Studios",
            amazon_rank: 1,
            price: 420.69
        }
    )
})

test("getGameByName return correct game object of game with name \"Catan\"", async () => {
    expect(await gamesData.getGameByName("Catan"))
    .toStrictEqual(
        {
            id: 'OIXt3DmJU0',
            name: 'Catan',
            url: 'https://www.boardgameatlas.com/game/OIXt3DmJU0/catan',
            image: 'https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1629324722072.jpg',
            publisher: 'KOSMOS',
            amazon_rank: 133,
            price: '32.97'
          }
    )
})

test("do_fetch does fetch correctly, returning a promise with a json response", async () => {
    expect(await gamesData.do_fetch("https://reqbin.com/echo/get/json"))
    .toStrictEqual(
        {
            success: "true"
        }
    )
})

/* test("do_fetch throws EXT_SVC_FAIL in case of HTTP_SERVER_ERROR", () => {
    expect(gamesData.do_fetch())
}) */

test("do_fetch throws NOT_FOUND in case of HTTP_CLIENT_ERROR", async() => {
    await expect(gamesData.do_fetch("https://google.com/aaaaaaaaaaa"))
    .rejects.toEqual(errors.NOT_FOUND("https://google.com/aaaaaaaaaaa"))
})
