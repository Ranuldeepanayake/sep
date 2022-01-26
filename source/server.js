//Includes.
const express = require('express');
const bodyParser = require("body-parser");
const path= require('path');
const file = require('fs');
const db = require('./js/db.js');
var session = require('express-session');

//Global constants.
const app = express();
const port = 3000;

//Path preparation.
const htmlPath= path.join(__dirname, '/html/');
const filePath= path.join(__dirname, '/html/'); 

//Use declarations.
//For session management.
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function (req, res){
  	res.sendFile(htmlPath + "index.html");
});

app.get('/sign-in', function (req, res){
	res.sendFile(htmlPath + "sign-in.html");
});

app.get('/sign-up', function (req, res){
	res.sendFile(htmlPath + "sign-up.html");
});

//This function processes the login form.
app.post("/sign-in-process", function(req, res){
	db.signIn(req.body, function (result){
		console.log(result);
		if(result.loggedIn== true){
			res.sendFile(htmlPath + "index.html");
			console.log("Logged in!")
		}else if(result.loggedIn== false){
			res.send('Invalid credentials!');
			console.log("Invalid credentials!")
		}
	});
});

//This function processes the sign up form.
app.post("/sign-up-process", function(req, res){
	db.signUp(req.body, function(result){
		res.send(result);
	});
});

app.get('/view-users', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	db.showUsers(function (result){
		console.log(result);

		//Write to a json file to be read by an HTML page.
		file.writeFile(filePath + "data.json", JSON.stringify(result), (err) => {
			if (err) throw err;
			console.log('Data written to JSON file');

			//Direct to an HTML file.
			res.sendFile(htmlPath + "view-users.html");
		});
	});
});

//Handle invalid URLs.
app.all('*', function(req, res) {
    	res.send('Bad request');
})

//Starts a server.
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
