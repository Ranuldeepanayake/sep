/*
This class provides back end functionality to the supplier class.
*/
const sql = require("mysql2");
const bcrypt = require('bcrypt');	//For hashing passwords.
const saltRounds = 2;	//Number of salt rounds for hashing.

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

//Handles the supplier sign up process.
function signUp(request, callback) {
	var query;
	var values;
	var passHash;

	//Hash the password with the number of salt rounds.
	passHash= bcrypt.hashSync(request.password, saltRounds);

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `insert into user(type, email, first_name, last_name, street, city, password) values (?, ?, ?, ?, ?, ?, ?)`;
	values= ['supplier', request.email, request.firstName, request.lastName, request.street, request.city, request.password];

	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");
		}else{
			//console.log("Record inserted with ID: " + JSON.stringify(result));
            console.log(result);

            //If data was successfully inserted into the user table, proceed with inserting data into the supplier table.
            query= `insert into supplier(supplier_id, nmra_registration, pharmacist_registration, store_description, 
				store_image) values (?, ?, ?, ?, ?)`;
	        values= [result.insertId, request.nmraRegistration, request.pharmacistRegistration, request.storeDescription, 'null'];

            connection.query(query, values, (err, result)=>{
                if(err){
					console.log(err.message);
                    connection.end();
                    return callback("failure");
                }else{
                    connection.end();
			        return callback("success");
                }
            });

			connection.end();
			return callback("success");
		}
	});
}

//Handles the supplier sign in process.
async function signIn(request, callback) {
	var query;
	var values;
	var result;

	var email= request.email;
	var password= request.password;

	//console.log(request.email + request.firstName + request.age + request.password);
	query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
	user.password, supplier.nmra_registration, supplier.pharmacist_registration, supplier.store_description, 
	supplier.store_image from user, supplier where user.user_id= supplier.supplier_id and user.email= ? and user.type='supplier'`;
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
}

//Lists all suppliers.
function showSuppliersVisitor(callback) {
	var query;

	createDbConnection();
	query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
	supplier.nmra_registration, supplier.pharmacist_registration, supplier.store_description, supplier.store_image
	from user, supplier where user.user_id= supplier.supplier_id and user.type= 'supplier'`;
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

//Lists all suppliers in the specified city.
function showSuppliersCustomer(city, callback) {
	var query;
	values= [city];

	createDbConnection();
	query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
	supplier.nmra_registration, supplier.pharmacist_registration, supplier.store_description, supplier.store_image 
	from user, supplier where user.user_id= supplier.supplier_id and user.type= 'supplier' and user.city like ?`;
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

//Updates supplier data.
function editProfile(request, userId, password, storeImage, changePassword, callback) {
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

	createDbConnection();
	//query= `update user set email= ?, first_name= ?, last_name= ?, street= ?, city= ?, password= ? where user_id= ?`;
	//values= [request.email, request.firstName, request.lastName, request.street, request.city, password, userId];

	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");

		}else{
			//Update data in the supplier table after successfully updating data in the user table.
			query= `update supplier set nmra_registration= ?, pharmacist_registration= ?, store_description= ?, 
			store_image= ? where supplier_id= ?`;
			values= [request.nmraRegistration, request.pharmacistRegistration, request.storeDescription, storeImage, 
			userId];
			
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
	});
}

//Handles showing data of a particular supplier.
function getProfileData(userId, callback) {
	var query;
	var values;

	createDbConnection();
	query= `select * from user, supplier where user.user_id= supplier.supplier_id and user.user_id= ?`;
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
				lastName: "", street: "", city: "", password: "", nmraRegistration: "", pharmacistRegistration: "", 
				storeDescription: "", storeImage: ""}

				authObject.loggedIn= "true";
				authObject.userId= result[0].user_id;
				authObject.userType= result[0].type;
				authObject.email= result[0].email;
				authObject.firstName= result[0].first_name;
				authObject.lastName= result[0].last_name;
				authObject.street= result[0].street;
				authObject.city= result[0].city;
				authObject.password= result[0].password;
				authObject.nmraRegistration= result[0].nmra_registration;
				authObject.pharmacistRegistration= result[0].pharmacist_registration;
				authObject.storeDescription= result[0].store_description;
				authObject.storeImage= result[0].store_image;
				
				console.log(authObject);
				return callback(authObject);

			}else{
				connection.end();
				return callback("failure");
			}
		}
	});
}

//Handles showing data of a particular supplier without sensistive information.
//Can be used to show individual supplier data to customers or visitors.
function getSupplierData(userId, callback) {
	var query;
	var values;

	createDbConnection();
	query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
	supplier.nmra_registration, supplier.pharmacist_registration, supplier.store_description, 
	supplier.store_image from user, supplier where user.user_id= supplier.supplier_id and user.user_id= ?`;
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
				lastName: "", street: "", city: "", nmraRegistration: "", pharmacistRegistration: "", 
				storeDescription: "", storeImage: ""}

				authObject.loggedIn= "true";
				authObject.userId= result[0].user_id;
				authObject.userType= result[0].type;
				authObject.email= result[0].email;
				authObject.firstName= result[0].first_name;
				authObject.lastName= result[0].last_name;
				authObject.street= result[0].street;
				authObject.city= result[0].city;
				authObject.nmraRegistration= result[0].nmra_registration;
				authObject.pharmacistRegistration= result[0].pharmacist_registration;
				authObject.storeDescription= result[0].store_description;
				authObject.storeImage= result[0].store_image;
				
				console.log(authObject);
				return callback(authObject);

			}else{
				connection.end();
				return callback("failure");
			}
		}
	});
}

//Handle showing items of a supplier to a customer or visitor.
function getItemsList(userId, callback) {
	var query;
	var values = [];

	//console.log(userId,prescribed, itemCategory, callback)

	/*//Check for undefined input.
	if(typeof prescribed== 'undefined' || typeof itemCategory== 'undefined'){
		return callback("failure");
	}

	//Dynamic query selection.
	if(itemCategory== 'null'){
		query= `select item_code, category, name, description, prescribed, quantity, unit_price, image, supplier_id from item 
		where supplier_id= ? and prescribed= ?`;
		values= [userId, prescribed];

	}else if(itemCategory!= 'null'){
		query= `select item_code, category, name, description, prescribed, quantity, unit_price, image, supplier_id from item 
		where supplier_id= ? and prescribed= ?  and type like ?`;	
		values= [userId, prescribed, itemCategory];
	}*/

	query= `select item_code, category, name, description, prescribed, quantity, unit_price, image, supplier_id from item 
		where supplier_id= ?`;
	values= [userId];

	createDbConnection();

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

//Handle showing individual items of a supplier to a customer or visitor.
function getItem(itemCode, callback) {
	var query;
	values= [itemCode];

	createDbConnection();
	query= `select item_code, category, name, description, prescribed, quantity, unit_price, image, supplier_id from item 
	where item_code= ?`;

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

//Handle showing orders placed on a supplier.
function getOrders(userId, callback) {
	var query;
	var values= [userId];

	createDbConnection();
	query= `select order_id, customer_id, supplier_id, date, prescription_needed, prescription_image, approval_status, total_price
	from order_table where supplier_id= ?`;

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
	var resultOrder, resultOrderItems;

	//Get data of the order first.
	query= `select order_id, customer_id, supplier_id, date, prescription_needed, prescription_image, approval_status, total_price
	from order_table where order_id= ?`;
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

	var object= [];
	object.push(resultOrder, resultOrderItems);
	return callback(object);
}

//Handle approving an order.
async function approveOrder(orderId, callback){
	var query;
	var values;
	var result;

	query= `update order_table set approval_status='approved' where order_id= ?`;
	values= [orderId];

	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		//console.log(result[0]);
		connection.end();
		return callback("success");

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
}

//Handle rejecting an order.
async function rejectOrder(orderId, callback){
	var query;
	var values;
	var result, resultItems;

	//Check if order was already rejected to prevent inventory quantity manipulation.
	query= `select approval_status from order_table where order_id= ?`;
	values= [orderId];

	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		console.log('Current order status: ' + result[0][0].approval_status);
		connection.end();

		if(result[0][0].approval_status== 'rejected'){
			return callback("Order already rejected!");
		}

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Update the order table first.
	query= `update order_table set approval_status='rejected' where order_id= ?`;
	values= [orderId];

	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		//console.log(result[0]);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Get the order item quantities to be added back to the inventory.
	query= `select item_code, quantity from order_item where order_id= ?`;
	values= [orderId];

	try {
		createDbConnection();
		resultItems= await connection.promise().query(query, values);
		console.log(result[0]);
		connection.end();

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}

	//Add the order item quantities back to the inventory.
	try {
		for(let i= 0; i< resultItems[0].length; i++){

			//As a fix for the lost connection issue.
			createDbConnection();

			//Get the existing quantity from item table.
			query= `select quantity from item where item_code= ?`;
			values= [resultItems[0][i].item_code];

			result= await connection.promise().query(query, values);
			quantity= result[0][0].quantity;
			console.log('Old quantity for item ' + resultItems[0][i].item_code+ ': ' + quantity);

			//Update the quantity.
			query= `update item set quantity= ? where item_code= ?`;
			values= [quantity + resultItems[0][i].quantity, resultItems[0][i].item_code];

			result= await connection.promise().query(query, values);
			console.log('Affected rows: ' + result[0].affectedRows);

			//Get the new quantity from the item table.
			query= `select quantity from item where item_code= ?`;
			values= [resultItems[0][i].item_code];

			result= await connection.promise().query(query, values);
			quantity= result[0][0].quantity;
			console.log('New quantity for item ' + resultItems[0][i].item_code+ ': ' + quantity);

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

//Handles adding items.
function addItem(request, imagePath, supplierId, callback) {
	var query;
	var values;
	var itemPrescribed;

	console.log(request);
	console.log(imagePath);

	//Handle the null 'item prescribed' check box value received from the form when the checkbox is unchecked.
	if(typeof request.itemPrescribed== 'undefined'){
		itemPrescribed= 'false';
	}else{
		itemPrescribed= request.itemPrescribed;
	}

	console.log(itemPrescribed);

	createDbConnection();
	query= `insert into item(category, name, description, prescribed, quantity, unit_price, image, supplier_id) 
	values (?, ?, ?, ?, ?, ?, ?, ?)`;
	values= [request.itemCategory, request.itemName, request.itemDescription, itemPrescribed, 
		request.itemQuantity, request.itemUnitPrice, imagePath, supplierId];

	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(err.message);
			connection.end();
			return callback("failure");
		}else{
			connection.end();
			return callback("success");
		}
	});
}
//Handle deleting an item.
async function removeItem(itemId, callback){
	var query;
	var values;
	var result;

	query= `delete from item where item_code= ?`;
	values= [itemId];

	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		//console.log(result[0]);
		connection.end();
		return callback("success");

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
}

//Handle updating an item.
async function updateItem(request, imagePath, saveImage, callback){
	var query;
	var values;
	var itemPrescribed;
	var result;

	//Handle the null 'item prescribed' check box value received from the form when the checkbox is unchecked.
	if(typeof request.itemPrescribed== 'undefined'){
		itemPrescribed= 'false';
	}else{
		itemPrescribed= request.itemPrescribed;
	}

	console.log(itemPrescribed);

	//Select the query depending on whether an image will be saved or not.
	if(saveImage== 'true'){
		query= `update item set category= ?, name= ?, description= ?, prescribed= ?, quantity= ?, unit_price= ?, image= ?, supplier_id= ?
		where item_code= ?`;
		values= [request.itemCategory, request.itemName, request.itemDescription, itemPrescribed, request.itemQuantity, 
			request.itemUnitPrice, imagePath, request.supplierId, request.itemCode];

	}else{
		query= `update item set category= ?, name= ?, description= ?, prescribed= ?, quantity= ?, unit_price= ?, supplier_id= ?
		where item_code= ?`;
		values= [request.itemCategory, request.itemName, request.itemDescription, itemPrescribed, request.itemQuantity, 
			request.itemUnitPrice, request.supplierId, request.itemCode];
	}

	try {
		createDbConnection();
		result= await connection.promise().query(query, values);
		//console.log(result[0]);
		connection.end();
		return callback("success");

	} catch (error) {
		console.log(error.message);
		connection.end();
		return callback("failure");
	}
}

//Exporting class members to the public.
module.exports.signUp= signUp;
module.exports.signIn= signIn;

module.exports.showSuppliersVisitor= showSuppliersVisitor;
module.exports.showSuppliersCustomer= showSuppliersCustomer;

module.exports.editProfile= editProfile;
module.exports.getProfileData= getProfileData;

module.exports.getSupplierData= getSupplierData;
module.exports.getItemsList= getItemsList;
module.exports.getItem= getItem;

module.exports.getOrders= getOrders;
module.exports.getOrder= getOrder;
module.exports.approveOrder= approveOrder;
module.exports.rejectOrder= rejectOrder;

module.exports.addItem= addItem;
module.exports.removeItem= removeItem;
module.exports.updateItem= updateItem;