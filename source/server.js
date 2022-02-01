//Includes.
const express = require('express');
const bodyParser = require("body-parser");
const path= require('path');
const file = require('fs');

//const db = require('./js/db.js');
const user = require('./js/user.js');

var session = require('express-session');
const cookieParser = require("cookie-parser");
const { Session } = require('express-session');

//Global constants.
const app = express();
const port = 3000;
const sessionTime= 1000* 60* 60;
const sessionSecret= 'sepprojectsessionsecret'

//Path preparation.
const htmlPath= path.join(__dirname, '/html/');
const filePath= path.join(__dirname, '/html/'); 

//Use declarations.
//For session management. Please change the session string.
app.use(session({
	secret: sessionSecret,
	cookie: { maxAge: sessionTime },
	resave: true,
	saveUninitialized: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

//This function delivers the home page.
app.get('/', function (req, res){
	res.sendFile(htmlPath + "index.html");
	//Below code is as a reference for session checking.
	/*if(req.session.loggedIn== 'true'){
		//Send session data to Ranga's front end using REST (JSON).
		res.send("Welcome " + req.session.firstName + " " + req.session.email);
	}else{
		res.sendFile(htmlPath + "index.html");
	}*/
});

//This function delivers the sign in form.
app.get('/sign-in', function (req, res){
	res.sendFile(htmlPath + "sign-in.html");
});

//This function delivers the sign up form.
app.get('/sign-up', function (req, res){
	res.sendFile(htmlPath + "sign-up.html");
});

//This function processes the login form.
app.post("/sign-in-process", function(req, res){
	//Delete any existing session.
	//req.session.destroy(); Didn't work??

	user.signIn(req.body, function (result){
		console.log(result);

		if(result.loggedIn== "true"){
			console.log("Logged in!")

			//Session creation.
			req.session.loggedIn = "true";
			req.session.userId = result.userId;
			req.session.email = result.email;
			req.session.firstName = result.firstName;

			res.redirect('/');
			//res.send("Logged in as: " + result.userName);
			//Send session data to Ranga's front end using REST (JSON).

		}else {
			console.log("Invalid credentials!");
			res.send('Invalid credentials!');
		}
	});
});

//This function processes the logout form.
app.get("/logout-process", function(req, res){
	//Destroying the session.
	req.session.destroy();
	console.log("Logged out!");
    res.redirect('/');
});

//This function processes the sign up form.
app.post("/sign-up-process", function(req, res){
	user.signUp(req.body, function(result){
		res.send(result);
		//Send result data to Ranga's front end using REST (JSON).
	});
});

//This function delivers a sample data presentation page.
app.get('/view-users', function(req, res) {
	res.sendFile(htmlPath + "view-users.html");
})

//An API which sends user data to the caller.
app.get('/view-users-process', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	//Add session authentication as well.
	user.showUsers(function (result){
		console.log(result);
		res.json(result);	
	});
});

//An API which sends session data to the caller.
app.get('/get-session', function(req, res) {
	var object= {loggedIn: req.session.loggedIn, userId: req.session.userId, email: req.session.email, 
		firstName: req.session.firstName}
	console.log(object);
	res.json(object);
})

//Handle invalid URLs.
app.all('*', function(req, res) {
    	res.send('Bad request');
})

//Starts a nodejs server instance.
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

/*	//Create a JS object.
	var object = {loggedIn : "", userName : "" }

	//Assign variables to the object.
	object.loggedIn= "true";
	object.userName= "Gehan";
	
	//Turn the object into JSON string.
	var jason= JSON.stringify(object);

	//Turn JSON string back to an object to be accessed.
	console.log(JSON.parse(jason));
	console.log(JSON.parse(jason).loggedIn);
*/
