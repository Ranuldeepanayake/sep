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
	query= `insert into user(email, first_name, age, password) values (?, ?, ?, ?)`;
	values= [request.email, request.firstName, request.age, request.password];

	connection.query(query, values, (err, result)=>{
		if(err){
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
	query= `select email, password from user where email= ? and password= ?`;
	values= [email, password];

	connection.query(query, values,function(err, result, fields) {
		if(err){
			connection.end();
			return callback("failure");

		}else{
			if (result.length > 0) {
				connection.end();

				var authObject = {loggedIn : "", userName : "" }
				authObject.loggedIn= "true";
				authObject.userName= result[0].email;
				
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
function showUsers(callback) {
	var query;

	createDbConnection();
	query= `select first_name, email, age from user`;
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

//Exporting class members to the public.
module.exports.signUp= signUp;
module.exports.signIn= signIn;
module.exports.showUsers= showUsers;