'use strict';


const errors = require('../borga-errors.js');

const gamesData = require("../board-games-data.js");


describe("getStatusClass tests", () => {
	test("getStatusClass returns correct class from a statusCode 500", () => {
		expect(gamesData.getStatusClass(504)).toEqual(5);
	});

	test("getStatusClass returns correct class from a statusCode 400", () => {
		expect(gamesData.getStatusClass(404)).toEqual(4);
	});

	test("getStatusClass returns correct class from a statusCode 303", () => {
		expect(gamesData.getStatusClass(303)).toEqual(3);
	});

	test("getStatusClass returns correct class from a statusCode 200", () => {
		expect(gamesData.getStatusClass(200)).toEqual(2);
	});

	test("getStatusClass returns correct class from a statusCode 100", () => {
		expect(gamesData.getStatusClass(100)).toEqual(1);
	});
});


describe("do_fetch tests", () => {
	test("do_fetch does fetch correctly, returning a promise with a json response", async () => {
		expect(await gamesData.do_fetch("https://reqbin.com/echo/get/json"))
			.toEqual(
				{
					success: "true"
				}
			);
	});

	test("do_fetch throws EXT_SVC_FAIL in case of HTTP_SERVER_ERROR", async () => {
		try {
			await gamesData.do_fetch("http://httpstat.us/500")
		}
		catch (err) {
			expect(err.name).toEqual(errors.EXT_SVC_FAIL().name)
		}
	});

	test("do_fetch throws NOT_FOUND in case of HTTP_CLIENT_ERROR", async () => {
		expect(gamesData.do_fetch("https://google.com/aaaaaaaaaaa"))
			.rejects.toEqual(errors.NOT_FOUND("https://google.com/aaaaaaaaaaa"));
	});
});
