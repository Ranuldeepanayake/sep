//const mocha= require('mocha');
const chai= require('chai');
//chai.config.showDiff = true;
const supplier = require('../js/supplier.js');

//Unit test to check if the supplier.showVisitor() dataset is defined. It may be undefined
//if there are database connectivity issues etc.
describe('Testing supplier.showVisitor()', function(){
    
    it('Test if the list of suppliers can be queried from the backend to be shown to a visitor.', function(){
        supplier.showSuppliersVisitor(function (result){
            //chai.assert.isString(result, "These are strings");
            //chai.assert.isNotArray(result, "This is an array.")
            chai.assert.isDefined(result, "Data set is empty!")
        });
    })
});

describe('Testing supplier.getItemsList()', function(){
    
    it('Test if the list of items for a particular supplier can be queried from the backend to be shown to a visitor/customer.', 
    function(){
        supplier.getItemsList('1', function (result){
            //chai.assert.isString(result, "These are strings");
            //chai.assert.isNotArray(result, "This is an array.")
            chai.assert.isDefined(result, "Data set is empty!")
        });
    })
});