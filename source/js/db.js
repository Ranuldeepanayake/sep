const sql = require("mysql");

createDbConnection= function () {

	console.log("Entered the function>");
	var con = sql.createConnection({
		host: "172.18.0.2",
  		user: "sep",
  		password: "RHFkwLSa62uXb7vQ",
		database: 'sep'
	});

	console.log("Entered stage 2>");

	con.connect(function(err) {
  		if (err) {
    			return console.error('error: ' + err.message);
  		}

  		console.log('Connected to the MySQL server.');
	});

};

module.exports.myDateTime = function () {
	return Date();
};

module.exports.signUp = function () {
	createDbConnection();
};
