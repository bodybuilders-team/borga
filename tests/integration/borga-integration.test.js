'use strict';


const fetch = require('node-fetch');
const request = require('supertest');

const config = require('../../borga-config');
const server = require('../../borga-server');


const es_spec = {
	url: config.es_url,
	prefix: 'test'
};
const app = server(es_spec, config.guest);


test('Confirm database is running', async () => {
	const response = await fetch(`${es_spec.url}/_cat/health`);
	expect(response.status).toBe(200);
});


describe("Explore Games integration tests", () => {

	// ----- searchGames tests -----

	test('Search games with gameName="Catan" with limit=1 works', async () => {
		const response = await request(app)
			.get('/api/games/search?gameName=Catan&limit=1')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body.games[0]).toEqual(
			{
				"id": "OIXt3DmJU0",
				"name": "Catan",
				"description": "\nThe women and men of your expedition build the first two settlements. Fortunately, the land is rich in natural resources. You build roads and new settlements that eventually become cities. Will you succeed in gaining supremacy on Catan? Barter trade dominates the scene. Some resources you have in abundance, other resources are scarce. Ore for wool, brick for lumber - you trade according to what is needed for your current building projects. Proceed strategically! If you found your settlements in the right places and skillfully trade your resources, then the odds will be in your favor. But your opponents are smart too.\n\r\n\nTo begin the game, we build the game board using hexagonal terrain tiles. Catan is born - a beautiful island with mountains, pastures, hills, fields, and forests, surrounded by the sea.\n\r\n\nEach of us places two small houses on spaces where three terrain hexes meet. They are our starting settlements.\n\r\n\nAnd so it begins. I roll two dice. An “11”! Each terrain hex is marked with a die roll number. Each player who owns a settlement adjacent to a terrain hex marked with the number rolled receives a resource produced by this hex. Hills produce brick, forests produce lumber, mountains produce ore, fields produce grain, and pastures produce wool.\n\r\n\nWe use these resources to expand across Catan: we build roads and new settlements, or we upgrade our existing settlements to cities. For example, a road costs 1 brick and 1 lumber. If we do not have the necessary resources, we can acquire them by trading with our opponents.\n\r\n\nEach settlement is worth 1 victory point and each city is worth 2 victory points. If you expand cleverly, you may be the first player to reach 10 victory points and thus win the game!\n",
				"url": "https://www.boardgameatlas.com/game/OIXt3DmJU0/catan",
				"image_url": "https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1629324722072.jpg",
				"publisher": "KOSMOS",
				"amazon_rank": 133,
				"price": "29.99",
				"mechanics": [
					"Dice Rolling",
					"Network and Route Building",
					"Trading"
				],
				"categories": [
					"Dice",
					"Economic",
					"Family Game",
					"Negotiation"
				]
			}
		);
	});

	test('Search games without gameName param replies with code 400 BAD REQUEST', async () => {
		const response = await request(app)
			.get('/api/games/search?')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual(
			{
				"cause":
				{
					"code": 1001,
					"info": { "gameName": "required parameter missing" },
					"message": "The request is bad",
					"name": "BAD_REQUEST"
				}
			}
		);
	});

	test('Search games with undefined gameName replies with code 400 BAD REQUEST', async () => {
		const response = await request(app)
			.get('/api/games/search?gameName=')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual(
			{
				"cause":
				{
					"code": 1001,
					"info": { "gameName": "required parameter missing" },
					"message": "The request is bad",
					"name": "BAD_REQUEST"
				}
			}
		);
	});

	test('Search games with invalid gameName replies with code 404 NOT FOUND', async () => {
		const response = await request(app)
			.get('/api/games/search?gameName=hdfgshgfdhsgdfhsgfhdsgh')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual(
			{
				"cause":
				{
					"code": 1002,
					"info": { "name": "hdfgshgfdhsgdfhsgfhdsgh" },
					"message": "The item does not exist",
					"name": "NOT_FOUND"
				}
			}
		);
	});


	// ----- popularGames tests -----

	test('Popular games without any created groups returns {}', async () => {
		const response = await request(app)
			.get('/api/games/popular')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"popularGames": {},
		});
	});

	test('Popular games with created groups works', async () => {
		const userId = config.guest.id;
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const gameId = 'OIXt3DmJU0';

		const group = await request(app)
			.post(`/api/user/${userId}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect(200);

		const groupId = group.body['Created group'].id;

		await request(app)
			.post(`/api/user/${userId}/groups/${groupId}/games`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ gameId })
			.expect(200);

		const response = await request(app)
			.get('/api/games/popular')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"popularGames": {
				'OIXt3DmJU0': 'Catan'
			},
		});


		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups_${groupId}_games`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_games`,
			{ method: 'DELETE' }
		);
	});
});


describe('User integration tests', () => {

	// ----- createUser tests -----
	test('Create new user works', async () => {
		const userId = 'testguestid';
		const userName = 'TestGuest';

		const response = await request(app)
			.post('/api/user')
			.set('Accept', 'application/json')
			.send({ userId, userName })
			.expect('Content-Type', /json/)
			.expect(200);

		const token = response.body['Created user'].token;

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"Created user": {
				"userId": userId,
				"token": token,
				"userName": userName
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users/_doc/${userId}?refresh=wait_for`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_tokens/_doc/${token}?refresh=wait_for`,
			{ method: 'DELETE' }
		);
	});

	test('Create new user without userId or userName replies with code 400 BAD REQUEST', async () => {
		const response = await request(app)
			.post('/api/user')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual(
			{
				"cause":
				{
					"code": 1001,
					"info": {
						"userId": "required property missing",
						"userName": "required property missing"
					},
					"message": "The request is bad",
					"name": "BAD_REQUEST"
				}
			});
	});

});


describe("Groups integration tests", () => {

	// ----- createGroup tests -----

	test('Create Group works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const response = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = response.body['Created group'].id;

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"Created group": {
				"description": groupDescription,
				"id": groupId,
				"name": groupName,
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});

	test('Create Group without groupName or groupDescription replies with 400 BAD_REQUEST', async () => {
		const response = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause":
			{
				"code": 1001,
				"info": {
					"groupName": "required property missing",
					"groupDescription": "required property missing"
				},
				"message": "The request is bad",
				"name": "BAD_REQUEST"
			}
		});
	});


	// ----- deleteGroup tests -----

	test('Delete Group works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.delete(`/api/user/${config.guest.id}/groups/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"Deleted group": {
				"description": groupDescription,
				"id": groupId,
				"name": groupName,
			}
		});
	});

	test('Delete Group without valid groupId replies with 404 NOT_FOUND', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const response = await request(app)
			.delete(`/api/user/${config.guest.id}/groups/notvalid`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause":
			{
				"code": 1002,
				"info": {
					"groupId": "notvalid",
				},
				"message": "The item does not exist",
				"name": "NOT_FOUND"
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});


	// ----- listUserGroups tests -----

	test('List Groups without any groups works', async () => {
		const response = await request(app)
			.get(`/api/user/${config.guest.id}/groups`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({});
	});

	test('List Groups with groups works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription });

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.get(`/api/user/${config.guest.id}/groups`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			[groupId]: {
				"description": groupDescription,
				"name": groupName
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);

	});


	// ----- groupDetails tests -----

	test('Group Details works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.get(`/api/user/${config.guest.id}/groups/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"description": groupDescription,
			"games": [],
			"id": groupId,
			"name": groupName,
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});

	test('Group Details without valid groupId replies with 404 NOT_FOUND', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const response = await request(app)
			.get(`/api/user/${config.guest.id}/groups/notvalid`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause":
			{
				"code": 1002,
				"info": {
					"groupId": "notvalid",
				},
				"message": "The item does not exist",
				"name": "NOT_FOUND"
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});


	// ----- editGroup tests -----

	test('Edit Group works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const newGroupName = 'TestGroup2';
		const newGroupDescription = 'TestDescription2';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.post(`/api/user/${config.guest.id}/groups/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ newGroupName, newGroupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			'Edited group': {
				"description": newGroupDescription,
				"id": groupId,
				"name": newGroupName
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});

	test('Edit Group without NewGroupName or NewGroupDescription replies with 400 BAD_REQUEST', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription })
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.post(`/api/user/${config.guest.id}/groups/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause":
			{
				"code": 1001,
				"info": {
					"newGroupDescription": "required property missing",
					"newGroupName": "required property missing"
				},
				"message": "The request is bad",
				"name": "BAD_REQUEST"
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});
});


describe("Games integration tests", () => {

	// ----- addGameToGroup tests -----

	test('Add game to group works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const gameId = 'OIXt3DmJU0';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription });

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.post(`/api/user/${config.guest.id}/groups/${groupId}/games`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.send({ gameId })
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body['Added game'].id).toEqual(gameId);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_games`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups_${groupId}_games`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});

	test('Add game to group without gameId replies with 400 BAD_REQUEST', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';

		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription });

		const groupId = group.body['Created group'].id;

		const response = await request(app)
			.post(`/api/user/${config.guest.id}/groups/${groupId}/games`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause":
			{
				"code": 1001,
				"info": {
					"gameId": "required property missing",
				},
				"message": "The request is bad",
				"name": "BAD_REQUEST"
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});


	// ----- removeGameFromGroup tests -----

	test('Remove game from group works', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const gameId = 'OIXt3DmJU0';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription });

		const groupId = group.body['Created group'].id;

		await request(app)
			.post(`/api/user/${config.guest.id}/groups/${groupId}/games`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.send({ gameId })
			.expect('Content-Type', /json/)
			.expect(200);

		const response = await request(app)
			.delete(`/api/user/${config.guest.id}/groups/${groupId}/games/${gameId}`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(response.body).toBeTruthy();
		expect(response.body['Removed game'].id).toEqual(gameId);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_games`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups_${groupId}_games`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);
	});

	test('Remove game from group without valid gameId replies with 404 NOT_FOUND', async () => {
		const groupName = 'TestGroup';
		const groupDescription = 'TestDescription';
		const gameId = 'OIXt3DmJU0';
		const group = await request(app)
			.post(`/api/user/${config.guest.id}/groups`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ groupName, groupDescription });

		const groupId = group.body['Created group'].id;

		await request(app)
			.post(`/api/user/${config.guest.id}/groups/${groupId}/games`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.send({ gameId })
			.expect('Content-Type', /json/)
			.expect(200);

		const response = await request(app)
			.delete(`/api/user/${config.guest.id}/groups/${groupId}/games/notvalid`)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.expect('Content-Type', /json/)
			.expect(404);

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause":
			{
				"code": 1002,
				"info": {
					"gameId": "notvalid",
				},
				"message": "The item does not exist",
				"name": "NOT_FOUND"
			}
		});

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_games`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups`,
			{ method: 'DELETE' }
		);

		await fetch(
			`${es_spec.url}/${es_spec.prefix}_users_${config.guest.id}_groups_${groupId}_games`,
			{ method: 'DELETE' }
		);
	});
});
