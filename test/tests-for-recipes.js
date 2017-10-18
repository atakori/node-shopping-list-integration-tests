const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

//Make the tests below targeting recipes

describe('Recipes', function() {
	//need to activate the server before anything runs
	//no arrow syntax since it might break our tests
	before(function() {
		return runServer();
	});

	//need to stop the server from running after everything runs in this block
	after(function() {
		return closeServer();
	});

	// Start GET test
	// Make a request to /recipes
	// look at response object to make sure it has appropriate keys
	it('should return the appropriate list items for GET', function () {
		//need to return a promise since this is mocha
		return chai.request(app).
		get('/recipes')
		.then(function(res) {
			res.should.have.status(200);
        	res.should.be.json;
        	res.body.should.be.a('array');
        	res.body.length.should.be.at.least(1);
        	//Check for name and ingredients keys/values
        	const expectedKeys = ['name', 'ingredients'];
        	res.body.forEach(function(field) {
        		field.should.be.a('object');
        		field.should.include.keys(expectedKeys);
        	});
		});
	});

	//MAKING A POST REQUEST
	//need to make a post request with new item
	//check response to make sure it has an id 
	//and the right status code 
	it('should update an item for POST', function () {
		const newRecipe = {name: 'Chocolate Milk', 
		ingredients: ['chocolate', 'milk', 'love']};
		//return a promise
		return chai.request(app)
		.post('/recipes')
		.send(newRecipe)
		.then(function(res) {
			res.should.have.status(201);
			res.should.be.json;
			res.body.should.be.a('object');
        	res.body.should.include.keys('name', 'ingredients');
       		res.body.id.should.not.be.null;
       		res.body.should.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
		});
	});
	//Making a PUT request
	//need to create test update date to use
	//make a get request to grab an id from an item
	//add the id to the test update data
	//make a put request with the test updatedata
	//Look at the response obj to make sure it has the correct status
	//and we get item with updated data
	it ('should make an updated list item with PUT request', function() {
		const updateData = {
			name: 'chocolate',
			ingredients: [
				'chocolate', 
				'milk', 
				'love'
			]
		};
		return chai.request(app)
		.get('/recipes')
		.then( function (res) {
			updateData.id = res.body[0].id;
			return chai.request(app)
			.put(`/recipes/${updateData.id}`)
			.send(updateData);
		})
		.then(function(res) {
			res.should.have.status(204);
		});
	});

	//Making the delete request
	//make a get request to grab the first id
	//delete the item and check the response to see if 204
	//code is returned
	it('should show the proper status 204 from the DELETE request', function() {
		return chai.request(app)
		.get('/recipes')
		.then(function(res) {
			return chai.request(app)
			.delete(`/recipes/${res.body[0].id}`);
		})
		.then(function (res) {
			res.should.have.status(204);
		});
	});
});