const chai= require('chai');
const customer = require('../js/customer.js');


//Unit test to check if a registered customer's sign in can be processed. 
describe("Testing customer.signIn()", function(){
    
    it("Test if a customers's sign in can be processed.", function(done){

var dataSet= {email : 'gehan@gmail.com', password : 'gehan'}

        customer.signIn(dataSet, function (result){
            chai.assert.equal(result.loggedIn, 'true', "Incorrect credentials!");
            chai.assert.isDefined(result, "Failed to process login!");
            chai.assert.isNotNull(result, "Failed to process login!");
            chai.assert.isNotEmpty(result, "Failed to process login!");
            done();
        });            
    });
});

//Unit test to check if customer.signUp() is functioning.
describe('Testing customer.signUp()', function(){
    
    it('Test if a customer can successfully create an account.', function(done){

        var dataSet= {
            email : "janith@gmail.com", firstName : "Janith", lastName : "Bada", street : "Main street",
            city : "Nugegoda", password : "gehan"
        }
        customer.signUp(dataSet, function (result){
            chai.assert.notEqual(result, 'failure', "Failed to create account!");
            chai.assert.isDefined(result, "Failed to create account!");
            chai.assert.isNotNull(result, "Failed to create account!");
            chai.assert.isNotEmpty(result, "Failed to create account!");
            done(); 
        });
    });
});

//Unit test to check if customer.editProfile() is functioning.
describe('Testing customer.editProfile()', function(){
    
    it('Test if a customer can successfully edit their profile.', function(done){

        var dataSet= {
            email : "janith@gmail.com", firstName : "Janithi", lastName : "Bada", street : "Main street",
            city : "Nugegoda"
        }

        var userId= 143, changePassword=  'false', password= '';

        customer.editProfile(dataSet, userId, password, changePassword, function (result){
            chai.assert.equal(result, 'success', "Failed to edit profile!");
            chai.assert.isDefined(result, "Failed to edit profile!");
            chai.assert.isNotNull(result, "Failed to edit profile!");
            chai.assert.isNotEmpty(result, "Failed to edit profile!");
            done(); 
        });
    });
});

//Unit test to check if customer.getOrders() is functioning.
describe('Testing customer.getOrders()', function(){
    
    it('Test if a customer can retrieve their past orders.', function(done){

        var userId= '1';

        customer.getOrders(userId, function (result){
            chai.assert.equal(result, 'success', "Failed to edit profile!");
            chai.assert.isDefined(result, "Failed to edit profile!");
            chai.assert.isNotNull(result, "Failed to edit profile!");
            chai.assert.isNotEmpty(result, "Failed to edit profile!");
            done(); 
        });
    });
});