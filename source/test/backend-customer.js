//const mocha= require('mocha');
const chai= require('chai');
//chai.config.showDiff = true;
const customer = require('../js/customer.js');


//Unit test to check if a registered customer's sign in can be processed. 
describe("Testing customer.signIn()", function(){
    
    it("Test if a customers's sign in can be processed.", function(done){

        customer.signIn({'email' : 'lahiru@gmail.com', 'password' : 'geha'}, function (result){

            //try {
            chai.assert.equal(result, 'failure', "Failed to process login!");
            chai.assert.equal(result.loggedIn, 'true', "Incorrect credentials!");
            chai.assert.isDefined(result, "Failed to process login!");
            chai.assert.isNotNull(result, "Failed to process login!");
            chai.assert.isNotEmpty(result, "Failed to process login!");
            done();
           // } catch (error) {
             //   console.log(error.message);
               // done();
            //}
            
        });     
        
    });
});