//const mocha= require('mocha');
const chai= require('chai');
//chai.config.showDiff = true;
const supplierCode = require('../js/supplier.js');

describe('Testing supplier.showVisitor()', function(){
   
    let supplier = supplierCode;
    
    it('Check if supplier data can be viewed by a visitor>.', function(){
        supplier.showSuppliersVisitor(function (result){
            //chai.assert.isString(result, "These are strings");
            //chai.assert.isNotArray(result, "This is an array.")
            chai.assert.isDefined(result, "Data set is empty!")
        });
    })
    
   /* it('check for a dish in menu.', function (){
        let dish= chef.checkMenu()
        assert.oneOf(dish, chef.dishes)

    });*/
    
});