const sql = require("mysql2");

var connection;

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
				return callback (JSON.stringify({'loggedIn' : true, 'userName': email}));
			} else {
				connection.end();
				return callback(JSON.stringify({'loggedIn' : false}));
			}
		}
	});
}

function showUsers(callback) {
	var query;

	createDbConnection();
	query= `select first_name, email, age from user`;
	connection.query(query,function(err, result, fields) {
		  //console.log(results); // results contains rows returned by server
		  //console.log(fields); // fields contains extra meta data about results, if available
		if(err){
			connection.end();
			return callback("failure");

		}else{
			connection.end();
			return callback(result);
		}
	});
}

module.exports.signUp= signUp;
module.exports.signIn= signIn;
module.exports.showUsers= showUsers;

//module.exports.searchForMedicine= searchForMedicine; 
//module.exports.placeOrder= placeOrder;
//module.exports.reviewPrescriptions= reviewPrescriptions;

