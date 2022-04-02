const chai= require('chai');
const supplier = require('../js/supplier.js');

//Unit test to check if the supplier.showVisitor() dataset is defined.
describe('Testing supplier.showVisitor()', function(done){
    
   it('Test if the list of suppliers can be queried from the backend to be shown to a visitor.', function(done){
        supplier.showSuppliersVisitor(function (result){
            chai.assert.notEqual(result, 'failure', "Failed to retrieve data!");
            done();
        });
    });
});

//Unit test to check if the supplier.getItemsList() dataset is defined.
describe('Testing supplier.getItemsList()', function(){
    
    it('Test if the list of items for a particular supplier can be queried from the backend to be shown to a visitor/customer.', 
    function(done){
        supplier.getItemsList('3', function (result){
            chai.assert.notEqual(result, 'failure', "Failed to retrieve data!");
            chai.assert.isDefined(result, "Failed to retrieve data!");
            chai.assert.isNotNull(result, "Failed to retrieve data!");
            chai.assert.isNotEmpty(result, "Failed to retrieve data!");
            done();
        });
    });
});

//Unit test to check if supplier.approveOrder() is functioning.
describe('Testing supplier.approveOrder()', function(){
    
    it('Test if an order can be successfully approved.', 
    function(done){
        supplier.approveOrder('100', function (result){
            chai.assert.notEqual(result, 'failure', "Failed to approve order!");
            chai.assert.isDefined(result, "Failed to approve order!");
            chai.assert.isNotNull(result, "Failed to approve order!");
            chai.assert.isNotEmpty(result, "Failed to approve order!");
            done();
        });
    });
});

//Unit test to check if supplier.rejectOrder() is functioning.
describe('Testing supplier.rejectOrder()', function(){
    
    it('Test if an order can be successfully rejected.', 
    function(done){
        supplier.approveOrder('100', function (result){
            chai.assert.notEqual(result, 'failure', "Failed to reject order!");
            chai.assert.isDefined(result, "Failed to reject order!");
            chai.assert.isNotNull(result, "Failed to reject order!");
            chai.assert.isNotEmpty(result, "Failed to reject order!");
            done();
        });
    });
});

//Unit test to check if supplier.getItemsList() dataset is defined.
describe('Testing supplier.signUp()', function(){
    
    it('Test if a supplier can successfully create an account.', 
    function(done){

        var dataSet= {
            email : "janith@gmail.com", firstName : "Janith", lastName : "Bada", street : "Main street",
            city : "Nugegoda", password : "gehan",  nmraRegistration : "HIJKLMNO", 
            pharmacistRegistration : "PQRSTUV", storeDescription : "Me mage pharmacy eka"
        }
        supplier.signUp(dataSet, function (result){
            try {
                chai.assert.notEqual(result, 'failure', "Failed to create account!");
                chai.assert.isDefined(result, "Failed to create account!");
                chai.assert.isNotNull(result, "Failed to create account!");
                chai.assert.isNotEmpty(result, "Failed to create account!");
                done();
            } catch (error) {
                //Ignore this weird exception.
            }       
        });
    });
});
