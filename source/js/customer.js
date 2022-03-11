/*
This class provides back end functionality to the user class.
*/
const sql = require("mysql2");
const express = require('express');
//var app = express();

var connection;

//Create a connection to a database.
function createDbConnection() {
	connection = sql.createConnection({
		host: "54.169.116.74",
  		user: "sep",
  		password: "RHFkwLSa62uXb7vQ",
		database: 'sep'
	});

	connection.connect(function(err) {
  		if (err) {
    			return console.error('error: ' + err.message);
  		}
  		console.log('Connected to the MySQL server.');
	});

	
}

//Handles the user sign up process.
function signUp(request, callback) {
	var query;
	var values;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `insert into user(type, email, first_name, last_name, street, city, password) values (?, ?, ?, ?, ?, ?, ?)`;
	values= ['customer', request.email, request.firstName, request.lastName, request.street, request.city, request.password];

	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");
		}else{
			//console.log("Record inserted with ID: " + JSON.stringify(result));
			connection.end();
			return callback("success");
		}
	});
}

//Handles the user sign in process.
function signIn(request, callback) {
	var query;
	var values;
	var email= request.email;
	var password= request.password;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `select user_id, type, email, first_name, last_name, street, city, password from user where email= ? and password= ?
	and type!= 'supplier'`;
	values= [email, password];

	connection.query(query, values,function(err, result, fields) {
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");

		}else{
			if (result.length > 0) {
				connection.end();

				var authObject = {loggedIn : "", userType: "", userId: "", email : "" , firstName: "", 
				lastName: "", street: "", city: "", password: ""}

				authObject.loggedIn= "true";
				authObject.userId= result[0].user_id;
				authObject.userType= result[0].type;
				authObject.email= result[0].email;
				authObject.firstName= result[0].first_name;
				authObject.lastName= result[0].last_name;
				authObject.street= result[0].street;
				authObject.city= result[0].city;
				authObject.password= result[0].password;
				
				console.log(authObject);
				return callback(authObject);
			} else {
				connection.end();
				console.log('DB authentication failure: '+ result);

				var authObject = {loggedIn : ""}
				authObject.loggedIn= "false";
				return callback(authObject);
			}
		}
	});
}

//Handles showing data of a particular user.
function getProfileData(userId, callback) {
	var query;
	var values;

	createDbConnection();
	query= `select * from user where user_id= ?`;
	values= [userId];

	connection.query(query, values, function(err, result, fields) {
		  //console.log(results); // Results contains rows returned by server.
		  //console.log(fields); // Fields contains extra meta data about results, if available.
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");

		}else{
			if (result.length > 0) {
				connection.end();

				var authObject = {loggedIn : "", userType: "", userId: "", email : "" , firstName: "", 
				lastName: "", street: "", city: "", password: ""}

				authObject.loggedIn= "true";
				authObject.userId= result[0].user_id;
				authObject.userType= result[0].type;
				authObject.email= result[0].email;
				authObject.firstName= result[0].first_name;
				authObject.lastName= result[0].last_name;
				authObject.street= result[0].street;
				authObject.city= result[0].city;
				authObject.password= result[0].password;
				
				console.log(authObject);
				return callback(authObject);

			}else{
				connection.end();
				return callback("failure");
			}
		}
	});
}

//Handles listing all the users.
function showUsers(callback) {
	var query;

	createDbConnection();
	query= `select user_id, type, email, first_name, last_name, street, city from user`;
	connection.query(query,function(err, result, fields) {
		  //console.log(results); // Results contains rows returned by server.
		  //console.log(fields); // Fields contains extra meta data about results, if available.
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");

		}else{
			connection.end();
			return callback(result);
		}
	});
}

//Updates customer data.
function editProfile(request, userId, password, callback) {
	var query;
	var values;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `update user set email= ?, first_name= ?, last_name= ?, street= ?, city= ?, password= ? where user_id= ?`;
	values= [request.email, request.firstName, request.lastName, request.street, request.city, password, userId];

	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");
		}else{
			console.log("Record updated with ID: " + JSON.stringify(result));
			connection.end();
			return callback("success");
		}
	});
}

//Handles creating an order.
//'async' makes the function asynchronous. This is needed to make the body synchronous.
async function createOrder(itemArray, totalPrice, supplierId, customerId, callback) {
	var query;
	var values;
	var result;
	var orderId;

	//console.log('###Data passed to the order>');
	//console.log(itemArray);

	//Hard coded values for testing.
	/*totalPrice= 1500;
	supplierId= 3;
	customerId= 1;
	itemArray= [{'itemId': '1', 'itemQuantity' : '3'}, {'itemId': '2', 'itemQuantity' : '5'}];*/
	//var date= '2022-02-26';

	//Create a date object. This gives both the date and time but the database will filter out only the date when inserting since
	//the column data type is date.
	var date= new Date();

	createDbConnection();

	//Insert record into the order table first.
	query= `insert into order_table (customer_id, supplier_id, date, total_price) values (?, ?, ?, ?)`;
	values= [customerId, supplierId, date, totalPrice];

	try {
		//The await keyword waits for an asynchronous function's promise result (resolve/reject) effectively
		//making it synchronous.
		result= await connection.promise().query(query, values);

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
	
	orderId= result[0].insertId;
	console.log('Order ID: ' + orderId);


	//Insert records into the order_item table in a loop.
	//Enclose within a try-catch block for easier error handling.
	try {
		//console.log('###Entering order items now (DB)>');

		for(let i= 0; i< itemArray.length; i++){

			//As a fix for the lost connection issue.
			createDbConnection();
			//Insert into order item.
			query= `insert into order_item (order_id, item_code, quantity) values (?, ?, ?)`;
			values= [orderId, itemArray[i].itemId, itemArray[i].itemQuantity];

			result= await connection.promise().query(query, values);
			console.log('Added order item ' + i);

			//Get the existing quantity from item table.
			query= `select quantity from item where item_code= ?`;
			values= [itemArray[i].itemId];

			result= await connection.promise().query(query, values);
			var quantity= result[0][0].quantity;
			console.log('Existing quantity: ' + quantity);

			//Subtract and update the new quantity.
			query= `update item set quantity= ? where item_code= ?`;
			values= [(quantity- itemArray[i].itemQuantity), itemArray[i].itemId];

			result= await connection.promise().query(query, values);

			//Get the existing quantity from item table.
			query= `select quantity from item where item_code= ?`;
			values= [itemArray[i].itemId];

			result= await connection.promise().query(query, values);
			quantity= result[0][0].quantity;
			console.log('New quantity: ' + quantity);

			connection.end();

		}
		connection.end();
		return callback("success");

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
}

async function createOrderPrescribed(itemArray, totalPrice, supplierId, customerId, imagePath, callback) {
	var query;
	var values;
	var result;
	var orderId;

	//Hard coded values for testing.
	/*totalPrice= 1500;
	supplierId= 3;
	customerId= 1;
	itemArray= [{'itemId': '1', 'itemQuantity' : '3'}, {'itemId': '2', 'itemQuantity' : '5'}];*/
	//var date= '2022-02-26';

	//Create a date object. This gives both the date and time but the database will filter out only the date when inserting since
	//the column data type is date.
	var date= new Date();

	createDbConnection();

	//Insert record into the order table first.
	query= `insert into order_table (customer_id, supplier_id, date, prescription_needed, prescription_image, total_price) 
			values (?, ?, ?, ?, ?, ?)`;
	values= [customerId, supplierId, date, 'true', imagePath, totalPrice];

	try {
		//The await keyword waits for an asynchronous function's promise result (resolve/reject) effectively
		//making it synchronous.
		result= await connection.promise().query(query, values);

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
	
	orderId= result[0].insertId;
	console.log('Order ID: ' + orderId);


	//Insert records into the order_item table in a loop.
	//Enclose within a try-catch block for easier error handling.
	try {
		for(let i= 0; i< itemArray.length; i++){

			//As a fix for the lost connection issue.
			createDbConnection();

			//Insert into order item.
			query= `insert into order_item (order_id, item_code, quantity) values (?, ?, ?)`;
			values= [orderId, itemArray[i].itemId, itemArray[i].itemQuantity];

			result= await connection.promise().query(query, values);
			console.log('Added order item ' + i);

			//Get the existing quantity from item table.
			query= `select quantity from item where item_code= ?`;
			values= [itemArray[i].itemId];

			result= await connection.promise().query(query, values);
			var quantity= result[0][0].quantity;
			console.log('Existing quantity: ' + quantity);

			//Subtract and update the new quantity.
			query= `update item set quantity= ? where item_code= ?`;
			values= [(quantity- itemArray[i].itemQuantity), itemArray[i].itemId];

			result= await connection.promise().query(query, values);

			//Get the existing quantity from item table.
			query= `select quantity from item where item_code= ?`;
			values= [itemArray[i].itemId];

			result= await connection.promise().query(query, values);
			quantity= result[0][0].quantity;
			console.log('New quantity: ' + quantity);

			connection.end();

		}
		connection.end();
		return callback("success");

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
}

function testPromises(){
	/*createOrder([{'itemId': '1', 'itemQuantity' : '3'}, {'itemId': '2', 'itemQuantity' : '5'}], 1500, 
	3, 1,).then(function(result){
		console.log(result);
	});*/

	createOrder([{'itemId': '1', 'itemQuantity' : '3'}, {'itemId': '4', 'itemQuantity' : '4'}], 1295, 3, 1, function(result){
		console.log(result);
	}).then({
		//Do something after the above executes.
	});
}

//Exporting class members to the public.
module.exports.signUp= signUp;
module.exports.signIn= signIn;
module.exports.showUsers= showUsers;

module.exports.editProfile= editProfile; 
module.exports.getProfileData= getProfileData;

module.exports.createOrder= createOrder;
module.exports.createOrderPrescribed= createOrderPrescribed;

module.exports.testPromises= testPromises;