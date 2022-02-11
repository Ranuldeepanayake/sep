/*
This class provides back end functionality to the supplier class.
*/
const sql = require("mysql2");

var connection;

//Create a connection to a database.
function createDbConnection() {
	connection = sql.createConnection({
		host: "13.212.249.95",
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
	values= ['supplier', request.email, request.firstName, request.lastName, request.street, request.city, request.password];

	connection.query(query, values, (err, result)=>{
		if(err){
			connection.end();
			return callback("failure");
		}else{
			//console.log("Record inserted with ID: " + JSON.stringify(result));
            console.log(result);

            //If data was successfully inserted into the user table, proceed with inserting data into the supplier table.
            query= `insert into supplier(supplier_id, nmra_registration, pharmacist_registration) values (?, ?, ?)`;
	        values= [result.insertId, request.nmraRegistration, request.pharmacistRegistration];

            connection.query(query, values, (err, result)=>{
                if(err){
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

//Handles the user sign in process.
function signIn(request, callback) {
	var query;
	var values;
	var email= request.email;
	var password= request.password;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
	supplier.nmra_registration, supplier.pharmacist_registration from user, supplier where
	user.user_id= supplier.supplier_id and user.email= ? and user.password= ? and user.type='supplier'`;
	values= [email, password];

	connection.query(query, values,function(err, result, fields) {
		if(err){
			connection.end();
			return callback("failure");

		}else{
			if (result.length > 0) {
				connection.end();

				var authObject = {loggedIn : "", userType: "", userId: "", email : "" , firstName: "", 
				lastName: "", street: "", city: "", nmraRegistration: "", pharmacistRegistration: ""}

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

//Handles listing all the users.
function showSuppliers(callback) {
	var query;

	createDbConnection();
	query= `select user.user_id, user.type, user.email, user.first_name, user.last_name, user.street, user.city, 
	supplier.nmra_registration, supplier.pharmacist_registration from user, supplier where
	user.user_id= supplier.supplier_id and user.type= 'supplier'`;
	connection.query(query,function(err, result, fields) {
		  //console.log(results); // Results contains rows returned by server.
		  //console.log(fields); // Fields contains extra meta data about results, if available.
		if(err){
			connection.end();
			return callback("failure");

		}else{
			connection.end();
			return callback(result);
		}
	});
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
	query= `insert into item(type, name, description, prescribed, quantity, unit_price, image, supplier_id) 
	values (?, ?, ?, ?, ?, ?, ?, ?)`;
	values= [request.itemCategory, request.itemName, request.itemDescription, itemPrescribed, 
		request.itemQuantity, request.itemUnitPrice, imagePath, supplierId];

	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(err);
			connection.end();
			return callback("failure");
		}else{
			connection.end();
			return callback("success");
		}
	});
}

//Exporting class members to the public.
module.exports.signUp= signUp;
module.exports.signIn= signIn;
module.exports.showSuppliers= showSuppliers;
module.exports.addItem= addItem;