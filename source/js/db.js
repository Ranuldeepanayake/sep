const sql = require("mysql");

var connection;

function createDbConnection() {
	//console.log("Entered the function>");
	connection = sql.createConnection({
		host: "172.18.0.2",
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

function signUp(request) {
	var query;
	var values;

	//console.log(request.email + request.firstName + request.age + request.password);
	createDbConnection();
	query= `insert into user(email, first_name, age, password) values (?, ?, ?, ?)`;
	values= [request.email, request.firstName, request.age, request.password];

	//console.log('Prepping query...');
	connection.query(query, values, (err, result)=>{
		if(err){
			console.log(error);

		}else{
			console.log("Record inserted with ID: " + JSON.stringify(result)); 
		}
	});
	connection.end();
}

module.exports.signUp= signUp;
