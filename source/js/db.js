const sql = require("mysql2");

var connection;
var result_set= null;

function createDbConnection() {
	//console.log("Entered the function>");
	connection = sql.createConnection({
		host: "13.212.249.95",
  		user: "sep",
  		password: "RHFkwLSa62uXb7vQ",
		database: 'sep'
	});

	//console.log("Entered stage 2>");

	connection.connect(function(err) {
  		if (err) {
    			return console.error('error: ' + err.message);
  		}

  		console.log('Connected to the MySQL server.');
	});

	
}

function signUp(request, callback) {
	var query;
	var values;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `insert into user(email, first_name, age, password) values (?, ?, ?, ?)`;
	values= [request.email, request.firstName, request.age, request.password];

	connection.query(query, values, (err, result)=>{
		if(err){
			return callback("failure");
		}else{
			//console.log("Record inserted with ID: " + JSON.stringify(result));
			return callback("success");
		}
	});
	connection.end();
	console.log("Connection ended");
}

function signIn(request, callback) {
	var query;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `select email, password from user`;
	connection.query(query,function(err, result, fields) {
		  //console.log(results); // results contains rows returned by server
		  //console.log(fields); // fields contains extra meta data about results, if available
		if(err){
			return callback("failure");

		}else{
			//console.log("Record inserted with ID: " + JSON.stringify(result));
			return callback("success");
		}
	});
	connection.end();
}

async function showUsers(callback) {
	var query;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `select first_name, email, age from user`;
	connection.query(query,function(err, result, fields) {
		  //console.log(results); // results contains rows returned by server
		  //console.log(fields); // fields contains extra meta data about results, if available
		if(err){
			return callback("failure");

		}else{
			//console.log("Record inserted with ID: " + JSON.stringify(result));
			return callback(result);
		}
	});
	connection.end();
}

module.exports.signUp= signUp;
module.exports.signIn= signIn;
module.exports.showUsers= showUsers;
