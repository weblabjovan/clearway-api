const mongoose = require('mongoose');
const keys = require('../keys/keys');
const RouteController = require('../helpers/routes/RouteController');
const RouteTimeController = require('../helpers/routes/RouteTimeController');
const Route = require('../models/Route');

describe('routes', () => {
	const routeController = new RouteController({id: keys.testUserId});
	const routeTimeController = new RouteTimeController({id: keys.testUserId});

	beforeAll(() => {
	  mongoose.connect(keys.mongoURI);
	});

	afterAll(async () => {
	  await routeController.activateRoute(keys.testRouteId);
	  mongoose.disconnect();
	});

	it('instantiate route controller', () => {
		expect(routeController).toHaveProperty('user.id');
		expect(routeController).toHaveProperty('route.base.models');
	});

	it('instantiate route time controller', () => {
		expect(routeTimeController).toHaveProperty('user.id');
		expect(routeTimeController).toHaveProperty('route.base.models');
		expect(routeTimeController).toHaveProperty('dateOp');
	});

	it('gets my routes', async () => {
		return await routeController.getAllMyRoutes().then( arr => {
				expect(Array.isArray(arr)).toBe(true);
				expect(arr.length).toBeGreaterThan(0);
				expect(Object.keys(arr[0].toJSON()).sort()).toEqual(["__v", "_id", "activatedAt", "date", "dateNumber", "end", "frequency", "price", "spots", "start", "status", "steps", "time", "timeNumber", "user", "waypoints"].sort());
				expect(arr[0].user).toEqual('5b50d84131d2942d88839e02');
				expect(arr[0].status).toEqual('active');
			}
		)
	});

	it('creates foundation for new route object', () => {
		const routeInfo = {user: keys.testUserId, start:'dcsc', end:'nešto', frequency: 3, spots: 2, price: 60};
		const waypoints = [1,2,3];
		const steps = [1,2,3];
		const time = '08:00';
		const timeNumber = 123445;
		const date = '21.02.2018';
		const dateNumber = 1222222222;
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber)).toMatchObject({
			user: expect.any(String),
			start: expect.any(String),
			end: expect.any(String),
			time: expect.any(String),
			timeNumber: expect.any(Number),
			frequency: expect.any(Number),
			dateNumber: expect.any(Number),
			spots: expect.any(Number),
			price: expect.any(Number),
			waypoints: expect.any(Array),
			steps: expect.any(Array)
		});
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber)).toMatchObject({
			user: routeInfo.user,
			start: routeInfo.start,
			end: routeInfo.end,
			time: time,
			timeNumber: timeNumber,
			frequency: routeInfo.frequency,
			spots: routeInfo.spots,
			price: routeInfo.price,
			waypoints: waypoints,
			steps: steps
		});
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).user).not.toBe('');
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).start).not.toBe('');
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).end).not.toBe('');
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).frequency).not.toEqual(0);
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).spots).not.toEqual(0);
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).price).not.toEqual(0);		
		expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).steps.length).toBeGreaterThan(2);
		if (routeInfo.frequency == 2) {
			expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).date).toEqual(date);
			expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).dateNumber).toEqual(dateNumber);
		}else{
			expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).date).toEqual(null);
			expect(routeController.makeCreateDataObj(routeInfo, waypoints, steps, time, timeNumber, date, dateNumber).dateNumber).toEqual(0);
		}
	});

	it('deletes the route', async () => {
		const beforeDeleteObject = await routeController.getRouteById(keys.testRouteId);
		await routeController.deleteRoute(keys.testRouteId);
		const afterDeleteObject = await routeController.getRouteById(keys.testRouteId);

		expect(beforeDeleteObject.status).toEqual('active');
		expect(beforeDeleteObject.id).toEqual(keys.testRouteId);
		expect(afterDeleteObject.status).toEqual('deleted');
		expect(afterDeleteObject.id).toEqual(keys.testRouteId);
	});

	it('decorates the search objects', async () => {
		const route = await routeController.getRouteById(keys.testRouteId); 
		const searchArr = [route];
		expect(Array.isArray(searchArr)).toBe(true);
		searchArr.map( search => {
			expect(Object.keys(search.toJSON()).sort()).toEqual(['waypoints', 'steps', '_id', 'user', 'start', 'end', 'time', 'timeNumber', 'frequency', 'date', 'dateNumber', 'spots', 'price', 'status', 'activatedAt', '__v'].sort());
			expect(search instanceof Route).toBe(true);
		});
		return await routeController.decorateSearchObjects(searchArr).then( arr => {
			expect(Array.isArray(arr)).toBe(true);
			expect(arr.length).toBe(searchArr.length);
			arr.map( object => {
				expect(Object.keys(object).sort()).toEqual(['userObj', 'time', 'price', 'spots', 'end', 'start', '_id'].sort())
			})
		})
	});

	it('filters out active routes according to search parametars', async () => {
		const route = await routeController.getRouteById(keys.testRouteId); 
		const start = { lat: 44.8047604, lng: 20.462158799999997 };
		const end = { lat: 44.8071227, lng: 20.480688299999997 };
		const distance = 200;
		const searchArr = [];
	
		expect(Object.keys(start).sort()).toEqual(['lat', 'lng']);
		expect(typeof start.lat).toEqual('number');
		expect(typeof start.lng).toEqual('number');
		expect(Object.keys(end).sort()).toEqual(['lat', 'lng']);
		expect(typeof end.lat).toEqual('number');
		expect(typeof end.lng).toEqual('number');
		expect(typeof distance).toEqual('number');
		expect(Array.isArray(searchArr)).toBe(true);
		searchArr.map( object => {
			expect(object instanceof Route).toBe(true);
		});
		const searchedArr = routeController.searchRoutes(searchArr, start, end, distance); 
		expect(Array.isArray(searchedArr)).toBe(true);
	});

	it('gets the closest steps from the position', async () => {
		const route = await routeController.getRouteById(keys.testRouteId); 
		const params = { 
			start: 'Resavska, Beograd, Serbia',
		  startObj: { lat: 44.8047604, lng: 20.462158799999997 },
		  end: 'Ruzveltova, Beograd, Serbia',
		  distance: '200',
		  endObj: { lat: 44.8071227, lng: 20.480688299999997 },
		  date: '2018-08-20T22:00:00.000Z',
		  dateString: '2018-08-20T22:00:00.000Z' 
		}
		const closestSteps = routeController.getClosestSteps(route, params);

		expect(route instanceof Route).toBe(true);
		expect(Array.isArray(route.steps)).toBe(true);
		expect(route.steps.length).toBeGreaterThan(2);
		expect(params.startObj).toBeDefined();
		expect(typeof params.startObj.lat).toEqual('number');
		expect(typeof params.startObj.lng).toEqual('number');
		expect(params.endObj).toBeDefined();
		expect(typeof params.endObj.lat).toEqual('number');
		expect(typeof params.endObj.lng).toEqual('number');
		expect(params.distance).toBeDefined();
		expect(closestSteps.start.step).toBeDefined();
		expect(closestSteps.start.distance).toBeDefined();
		expect(typeof closestSteps.start.step).toEqual('number');
		expect(typeof closestSteps.start.distance).toEqual('number');
		expect(closestSteps.end.step).toBeDefined();
		expect(closestSteps.end.distance).toBeDefined();
		expect(typeof closestSteps.end.step).toEqual('number');
		expect(typeof closestSteps.end.distance).toEqual('number');
		expect(closestSteps.start.distance).toEqual(0);
		expect(closestSteps.end.distance).toEqual(0);
	});

	it('prepares the route for the reservation view', async () => {
		const route = await routeController.getRouteById(keys.testRouteId); 
		const params = { 
			start: 'Resavska, Beograd, Serbia',
		  startObj: { lat: 44.8047604, lng: 20.462158799999997 },
		  end: 'Ruzveltova, Beograd, Serbia',
		  distance: '200',
		  endObj: { lat: 44.8071227, lng: 20.480688299999997 },
		  date: '2018-08-20T22:00:00.000Z',
		  dateString: '2018-08-20T22:00:00.000Z' 
		}
		const prepRoute = await routeController.prepareRouteForReservation(route, params);
		expect(Object.keys(prepRoute).sort()).toEqual(['userObj', 'time', 'price', 'spots', 'end', 'start', '_id', 'rideTime', 'rideStart', 'rideDiscount', 'startDistance', 'rideDate'].sort());
		expect(prepRoute.rideTime).toEqual(5);
		expect(prepRoute.rideDiscount).toEqual(6);
		expect(prepRoute.startDistance).toEqual(0);
	});

	it('matches frequencies during the search', () => {
		const weekDay = new Date('Fri Aug 17 2018 21:52:13 GMT+0200 (Central European Summer Time').toISOString();
		const weekendDay = new Date('Sat Aug 18 2018 21:52:13 GMT+0200 (Central European Summer Time').toISOString();
		const freqencies1 = routeTimeController.frequncyMatcher(weekDay);
		const freqencies2 = routeTimeController.frequncyMatcher(weekendDay);
		expect(freqencies1).toEqual([ 3, 4, 2 ]);
		expect(freqencies2).toEqual([ 3, 5, 2 ]);
	});

	it('indicates my overlaping route', async () => {
		const weekDay = new Date('Fri Aug 17 2018 21:52:13 GMT+0200');
		const weekendDay = new Date('Sat Aug 18 2018 21:52:13 GMT+0200');
		const freq = 4;
		const timeNumber = 480;
		const route = await routeController.getRouteById(keys.testRouteId);

		const overlap1 = routeTimeController.isRouteOverlap(route, 480, 3, null);
		const overlap2 = routeTimeController.isRouteOverlap(route, 480, 4, null);
		const overlap3 = routeTimeController.isRouteOverlap(route, 510, 3, null);
		const overlap4 = routeTimeController.isRouteOverlap(route, 510, 4, null);
		const overlap5 = routeTimeController.isRouteOverlap(route, 480, 5, null);
		const overlap6 = routeTimeController.isRouteOverlap(route, 480, 2, weekDay);
		const overlap7 = routeTimeController.isRouteOverlap(route, 510, 2, weekDay);
		const overlap8 = routeTimeController.isRouteOverlap(route, 480, 2, weekendDay);
		const overlap9 = routeTimeController.isRouteOverlap(route, 640, 3, null);
		const overlap10 = routeTimeController.isRouteOverlap(route, 640, 4, null);
		const overlap11 = routeTimeController.isRouteOverlap(route, 640, 2, weekDay);

		expect(typeof freq).toEqual('number');
		expect(typeof timeNumber).toEqual('number');
		expect(route instanceof Route).toBe(true);
		expect(isNaN(Date.parse(weekDay))).toBe(false);
		expect(overlap1).toBe(true);
		expect(overlap2).toBe(true);
		expect(overlap3).toBe(true);
		expect(overlap4).toBe(true);
		expect(overlap5).toBe(false);
		expect(overlap6).toBe(true);
		expect(overlap7).toBe(true);
		expect(overlap8).toBe(false);
		expect(overlap9).toBe(false);
		expect(overlap10).toBe(false);
		expect(overlap11).toBe(false);
	});

})

