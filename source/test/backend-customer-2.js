const chai= require('chai');
const customer = require('../js/customer.js');

//Unit test to check if customer.createOrder() is functioning.
describe('Testing customer.createOrder()', function(){
    
    it('Test if a customer can create a non-prescribed order.', function(done){

        var itemArray= [
            {itemId: '4', itemQuantity: '2'}, {itemId: '21', itemQuantity: '1'}
        ]
        var totalPrice= 2440, supplierId= 3, customerId= 15;

        customer.createOrder(itemArray, totalPrice, supplierId, customerId, function (result){
            chai.assert.equal(result, 'success', "Failed create a non-prescribed order!");
            chai.assert.isDefined(result, "Failed create a non-prescribed order!");
            chai.assert.isNotNull(result, "Failed create a non-prescribed order!");
            chai.assert.isNotEmpty(result, "Failed create a non-prescribed order!");
            done(); 
        });
    });
});

//Unit test to check if customer.getOrders() is functioning.
describe('Testing customer.getOrders()', function(){
    
    it('Test if a customer can retrieve their past orders.', function(done){

        var userId= 1;

        customer.getOrders(userId, function (result){
            chai.assert.notEqual(result, 'failure', "Failed get past orders!");
            chai.assert.isDefined(result, "Failed get past orders!");
            done(); 
        });
    });
});
