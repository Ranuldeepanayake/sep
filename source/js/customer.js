/*
This class provides back end functionality to the user class.
*/
const sql = require("mysql2");
const bcrypt = require('bcrypt');	//For hashing passwords.
const saltRounds = 2;	//Number of salt rounds for hashing.

//const express = require('express');
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

//Handles the customer sign up process.
function signUp(request, callback) {
	var query;
	var values;
	var passHash;

	//Hash the password with the number of salt rounds.
	passHash= bcrypt.hashSync(request.password, saltRounds);

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `insert into user(type, email, first_name, last_name, street, city, password) values (?, ?, ?, ?, ?, ?, ?)`;
	values= ['customer', request.email, request.firstName, request.lastName, request.street, request.city, passHash];

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

//Handles the customer sign in process.
/* async function signIn(request, callback) {
	var query;
	var values;
	var result;
	
	var email= request.email;
	var password= request.password;
	//Hash the password with the number of salt rounds for hash comparison.
	//var password= bcrypt.hashSync(request.password, saltRounds);
	//console.log('Hashed password: ' + password);

	//console.log(request.email + request.firstName + request.age + request.password);
	query= `select user_id, type, email, first_name, last_name, street, city, password from user where email= ? and type= 'customer'`;
	values= [email];

	//Check if the account exists.
	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		console.log(result[0]);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Check if at least account with the provide email exists. 
	if(result[0].length> 0){
		console.log('Account exists');

		console.log('Hash stored in the database: ' + result[0][0].password);

		//Check if password hashes are matching.
		if(bcrypt.compareSync(password, result[0][0].password)){

			var authObject = {loggedIn : "", userType: "", userId: "", email : "" , firstName: "", 
			lastName: "", street: "", city: "", password: ""}

			authObject.loggedIn= "true";
			authObject.userId= result[0][0].user_id;
			authObject.userType= result[0][0].type;
			authObject.email= result[0][0].email;
			authObject.firstName= result[0][0].first_name;
			authObject.lastName= result[0][0].last_name;
			authObject.street= result[0][0].street;
			authObject.city= result[0][0].city;
			authObject.password= result[0][0].password;
			
			console.log('User authenticated!');
			console.log(authObject);
			return callback(authObject);

		}else{
			console.log('DB authentication failure!');

			var authObject = {loggedIn : ""}
			authObject.loggedIn= "false";
			return callback(authObject);
		}
		
	}else{
		console.log('Account does not exist!');

		var authObject = {loggedIn : ""}
		authObject.loggedIn= "false";
		return callback(authObject);
	}
} */

async function signIn(request, callback){
	var query;
	var values;
	var result;
	
	var email= request.email;
	var password= request.password;
	//Hash the password with the number of salt rounds for hash comparison.
	//var password= bcrypt.hashSync(request.password, saltRounds);
	//console.log('Hashed password: ' + password);

	//console.log(request.email + request.firstName + request.age + request.password);
	query= `select user_id, type, email, password from user where email= ?`;
	values= [email];

	//Check if the account exists.
	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		console.log(result[0]);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Check if at least account with the provide email exists. 
	if(result[0].length> 0){
		console.log('Account exists');
		console.log('Hash stored in the database: ' + result[0][0].password);

		//Check if password hashes are matching.
		if(bcrypt.compareSync(password, result[0][0].password)){
			console.log('Credentials are correct>');

			//Check the account type.
			if(result[0][0].type== 'customer'){
				query= `select user_id, type, email, first_name, last_name, street, city, password from user where user_id= ?`;
				values= [result[0][0].user_id];

				try {
					createDbConnection();
					result= await connection.promise().query(query, values);
					console.log(result[0]);
					connection.end();

					var authObject = {loggedIn : "", userType: "", userId: "", email : "" , firstName: "", 
					lastName: "", street: "", city: "", password: ""}

					authObject.loggedIn= "true";
					authObject.userId= result[0][0].user_id;
					authObject.userType= result[0][0].type;
					authObject.email= result[0][0].email;
					authObject.firstName= result[0][0].first_name;
					authObject.lastName= result[0][0].last_name;
					authObject.street= result[0][0].street;
					authObject.city= result[0][0].city;
					authObject.password= result[0][0].password;
					
					console.log(authObject);
					return callback(authObject);
			
				} catch (error) {
					console.log(error.message);
					connection.end();
					return callback("failure");
				}

			}else if(result[0][0].type== 'supplier'){
				query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
				user.password, supplier.nmra_registration, supplier.pharmacist_registration, supplier.store_description, 
				supplier.store_image from user, supplier where user.user_id= supplier.supplier_id and user.user_id= ?`;
				values= [result[0][0].user_id];

				try {
					createDbConnection();
					result= await connection.promise().query(query, values);
					console.log(result[0]);
					connection.end();

					var authObject = {loggedIn : "", userType: "", userId: "", email : "" , firstName: "", 
					lastName: "", street: "", city: "", password: "", nmraRegistration: "", pharmacistRegistration: "", 
					storeDescription: "", storeImage: ""}

					authObject.loggedIn= "true";
					authObject.userId= result[0][0].user_id;
					authObject.userType= result[0][0].type;
					authObject.email= result[0][0].email;
					authObject.firstName= result[0][0].first_name;
					authObject.lastName= result[0][0].last_name;
					authObject.street= result[0][0].street;
					authObject.city= result[0][0].city;
					authObject.password= result[0][0].password;
					authObject.nmraRegistration= result[0][0].nmra_registration;
					authObject.pharmacistRegistration= result[0][0].pharmacist_registration;
					authObject.storeDescription= result[0][0].store_description;
					authObject.storeImage= result[0][0].store_image;

					console.log(authObject);
					return callback(authObject);

				}catch (error) {
					console.log(error.message);
					connection.end();
					return callback("failure");
				}

			}else{
				console.log('Incorrect account type!');

				var authObject = {loggedIn : ""}
				authObject.loggedIn= "false";
				return callback(authObject);
			}

		}else{
			console.log('Incorrect credentials!');

			var authObject = {loggedIn : ""}
			authObject.loggedIn= "false";
			return callback(authObject);
		}
		
	}else{
		console.log('Account does not exist!');

		var authObject = {loggedIn : ""}
		authObject.loggedIn= "false";
		return callback(authObject);
	}
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
function editProfile(request, userId, password, changePassword, callback) {
	var query;
	var values;

	console.log('Change password: ' + changePassword);
	console.log('Password: ' + password);

	if(changePassword== 'false'){
		query= `update user set email= ?, first_name= ?, last_name= ?, street= ?, city= ? where user_id= ?`;
		values= [request.email, request.firstName, request.lastName, request.street, request.city, userId];

	}else if(changePassword== 'true'){
		password= bcrypt.hashSync(password, saltRounds);
		console.log('Password hash: ' + password);

		query= `update user set email= ?, first_name= ?, last_name= ?, street= ?, city= ?, password= ? where user_id= ?`
		values= [request.email, request.firstName, request.lastName, request.street, request.city, password, userId];
	}

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	//query= `update user set email= ?, first_name= ?, last_name= ?, street= ?, city= ?, password= ? where user_id= ?`;
	//values= [request.email, request.firstName, request.lastName, request.street, request.city, password, userId];

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
	query= `insert into order_table (customer_id, supplier_id, date, approval_status, total_price) values (?, ?, ?, 'approved', ?)`;
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

//Handle showing the order history of a customer.
function getOrders(userId, callback) {
	var query;
	var values= [userId];

	createDbConnection();
	query= `select order_id, customer_id, supplier_id, date, prescription_needed, prescription_image, approval_status, approval_message, 
	total_price from order_table where customer_id= ?`;

	connection.query(query, values,function(err, result, fields) {
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

//Handle showing a particular order.
async function getOrder(orderId, callback) {
	var query;
	var values= [orderId];
	var resultOrder, resultOrderItems, resultOrderSupplier;
	
	//Get data of the order first.
	query= `select order_id, customer_id, supplier_id, date, prescription_needed, prescription_image, approval_status, approval_message, 
	total_price from order_table where order_id= ?`;
	var values= [orderId];

	try {
		createDbConnection();
		resultOrder= await connection.promise().query(query, values);
		resultOrder= resultOrder[0][0];
		console.log(resultOrder);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Get data of order items.
	query= `select order_item.item_code, order_item.quantity, item.category, item.name, item.description, item.prescribed, 
	item.unit_price, item.image from order_item, item where order_item.item_code= item.item_code and order_id= ?`;
	var values= [orderId];

	try {
		createDbConnection();
		resultOrderItems= await connection.promise().query(query, values);
		resultOrderItems= resultOrderItems[0];
		console.log(resultOrderItems);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Get data of the supplier.
	query= `select user.email, user.first_name, user.last_name, user.street, user.city, 
	supplier.nmra_registration, supplier.pharmacist_registration, supplier.store_description, 
	supplier.store_image from user, supplier where user.user_id= supplier.supplier_id and user.user_id= ?`;
	values= [resultOrder.supplier_id];

	try {
		createDbConnection();
		resultOrderSupplier= await connection.promise().query(query, values);
		resultOrderSupplier= resultOrderSupplier[0][0];
		console.log(resultOrderSupplier);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	var object= [];
	object.push(resultOrder, resultOrderItems, resultOrderSupplier);
	return callback(object);
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

module.exports.getOrders= getOrders;
module.exports.getOrder= getOrder;

module.exports.testPromises= testPromises;