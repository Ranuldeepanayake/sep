/*
This class provides back end functionality to the user class.
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
function createOrder(itemArray, totalPrice, supplierId, customerId, callback) {
	/*var query;

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
	});*/
}

function createOrderPrescribed(itemArray, totalPrice, supplierId, customerId, imagePath, callback) {
	/*var query;

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
	});*/
}

function testPromises(){
	var query;
	var data;	

	createDbConnection();

	//query= `select * from user`;
	//const [rows, fields]= await connection.execute(query);

	/*for(let i= 0; i< 3; i++){
		display().then(function(result){
			console.log(result);
		}).then(function(){ console.log('After')});
	}*/
	
	display().then(function(result){
		console.log(result);
	});
}

async function display(){
	var query= `select user_id, type, email, first_name, last_name, street, city from user`;
	var result= await connection.promise().query(query);
	return result[0];
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