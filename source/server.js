//Includes.
const express = require('express');
const bodyParser = require("body-parser");
const path= require('path');
const file = require('fs');

//////////////////////////////////////////////////////////////////////////
const multer  = require('multer');
const upload = multer({ dest: './html/uploads' });
//////////////////////////////////////////////////////////////////////////

//const db = require('./js/db.js');
const customer = require('./js/customer.js');
const supplier = require('./js/supplier.js');

var session = require('express-session');
const cookieParser = require("cookie-parser");
const { Session } = require('express-session');
const { serialize } = require('v8');

//Global constants.
const app = express();
const port = 3000;
const sessionTime= 1000* 60* 60;
const sessionSecret= 'sepprojectsessionsecret'

//Path preparation.
const htmlPath= path.join(__dirname, '/html/');
const filePath= path.join(__dirname, '/html/'); 
const rangaFrontEnd= path.join(__dirname, '/Medi2Door/');

//Use declarations.
//For session management. Please change the session string.
app.use(session({
	secret: sessionSecret,
	cookie: { maxAge: sessionTime },
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(__dirname + '/Medi2Door/'));	//Use Ranga's static resources.
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Common functions for the customer and the supllier.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function delivers the home page.
app.get('/', function (req, res){
	res.sendFile(rangaFrontEnd + "Login.html");
	//Below code is as a reference for session checking.
	/*if(req.session.loggedIn== 'true'){
		//Send session data to Ranga's front end using REST (JSON).
		res.send("Welcome " + req.session.firstName + " " + req.session.email);
	}else{
		res.sendFile(htmlPath + "index.html");
	}*/
});

//This function processes the sign up form.
app.post("/sign-up-process", function(req, res){
	console.log('**************Received sign up form data>');
	console.log(req.body);

	//Bad input sanitization.
	if(req.body.userType== 'null'){
		res.json({'result' : 'Please select a user type!'});
		return;
	}

	//Check for empty fields if the user type is 'customer'.
	if((req.body.userType== 'customer') && (req.body.email== '' || req.body.firstName== '' || req.body.lastName== '' || 
	req.body.street== '' || req.body.city== 'null' || req.body.password== '' || req.body.confirmPassword== '')){
		res.json({'result' : 'Fields are empty!'});
		return;
	}

	//Check for empty fields if the user type is 'supplier'.
	if((req.body.userType== 'supplier') && (req.body.email== '' || req.body.firstName== '' || req.body.lastName== '' || 
	req.body.street== '' || req.body.city== 'null' || req.body.password== '' || req.body.confirmPassword== '' || 
	req.body.nmraRegistration== '' || req.body.pharmacistRegistration== '')){
		res.json({'result' : 'Fields are empty!'});
		return;
	}

	//Check if passwords are matching.
	if(req.body.password != req.body.confirmPassword){
		res.json({'result' : 'Passwords do not match!'});
		return;
	}

	if(req.body.userType== 'customer'){
		//Save data in the database.
		customer.signUp(req.body, function(result){
			//res.sendFile(htmlPath + result + '.html');
			//res.end(result);
			res.json({'result' : result});
			return;
		});
		
	}

	if(req.body.userType== 'supplier'){
		//Save data in the database.
		supplier.signUp(req.body, function(result){
			//res.sendFile(htmlPath + result + '.html');
			res.end(result);
			//res.json({'result' : result}); //This causes the program to crash??
			return;
		});
	}
});


//This function processes the login form.
app.post("/sign-in-process", function(req, res){
	console.log('**************Received sign in form data>');
	console.log(req.body);

	//Delete any existing session.
	//req.session.destroy(); Didn't work??

	//Check the account type using the form dropdown.
	if(req.body.email== '' || req.body.password== ''){
		res.json({'result' : 'Fields are empty!'});
		return;
	}

	if(req.body.userType== 'null'){
		res.json({'result' : 'Select user type!'});
		return;
	}

	if(req.body.userType== 'customer'){
	customer.signIn(req.body, function (result){
		console.log(result);

		if(result.loggedIn== "true"){
			console.log("**************Logged in!")

			//Session creation.
			req.session.loggedIn = "true";
			req.session.userId = result.userId;
			req.session.userType = result.userType;
			req.session.email = result.email;
			req.session.firstName = result.firstName;
			req.session.lastName = result.lastName;
			req.session.street = result.street;
			req.session.city = result.city;

			res.sendFile(htmlPath + 'success.html');
			//res.redirect('/');

		}else {
			req.session.loggedIn = "false";
			console.log("**************Invalid credentials!");
			res.json({'result' : 'Invalid credentials!'});
			//res.sendFile(htmlPath + 'invalid-credentials.html');
		}
	});

	}else if(req.body.userType== 'supplier'){
		supplier.signIn(req.body, function (result){
			console.log(result);
	
			if(result.loggedIn== "true"){
				console.log("**************Logged in!")
	
				//Session creation.
				req.session.loggedIn = "true";
				req.session.userId = result.userId;
				req.session.userType = result.userType;
				req.session.email = result.email;
				req.session.firstName = result.firstName;
				req.session.lastName = result.lastName;
				req.session.street = result.street;
				req.session.city = result.city;
				req.session.nmraRegistration = result.nmraRegistration;
				req.session.pharmacistRegistration = result.pharmacistRegistration;
	
				res.sendFile(htmlPath + 'success.html');
				//res.redirect('/');
	
			}else{
				req.session.loggedIn = "false";
				console.log("**************Invalid credentials!");
				res.json({'result' : 'Invalid credentials!'});
				//res.sendFile(htmlPath + 'invalid-credentials.html');
			}
		});
	}	
});

//This function processes the logout form.
app.get("/logout-process", function(req, res){
	//Destroying the session.
	req.session.destroy();
	console.log("**************Logged out!");
    res.redirect('/');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Customer
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function delivers the sign up form.
/*
app.get('/sign-up-customer', function (req, res){
	res.sendFile(htmlPath + "sign-up-customer.html");
});

//This function processes the sign up form.
app.post("/sign-up-customer-process", function(req, res){
	customer.signUp(req.body, function(result){
		res.sendFile(htmlPath + result + '.html');
		//res.end(result);
		//Send result data to Ranga's front end using REST (JSON).
	});
});

//This function delivers the sign in form.

app.get('/sign-in', function (req, res){
	res.sendFile(htmlPath + "sign-in.html");
});
*/


//This function delivers a sample data presentation page.
app.get('/view-users', function(req, res) {
	res.sendFile(htmlPath + "view-users.html");
});

//An API which sends user data to the caller.
app.get('/view-users-process', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	//Add session authentication as well.
	customer.showUsers(function (result){
		console.log(result);
		res.json(result);	
	});
});

//An API which sends session data to the caller.
app.get('/get-session', function(req, res) {

	var object;

	if(req.session.loggedIn== 'false'){
		res.json({loggedIn: 'false'});
	}else if(req.session.loggedIn== 'true' && (req.session.userType== 'customer')){
		object= {loggedIn: req.session.loggedIn, userId: req.session.userId, userType: req.session.userType,
			email: req.session.email, firstName: req.session.firstName, lastName: req.session.lastName, 
			street: req.session.street, city: req.session.city}
	}else if(req.session.loggedIn== 'true' && req.session.userType== 'supplier'){
		object= {loggedIn: req.session.loggedIn, userId: req.session.userId, userType: req.session.userType,
			email: req.session.email, firstName: req.session.firstName, lastName: req.session.lastName, 
			street: req.session.street, city: req.session.city, nmraRegistration: req.session.nmraRegistration, 
			pharmacistRegistration: req.session.pharmacistRegistration}
	}
	
	console.log(object);
	res.json(object);
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Item
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function delivers the add item form.
app.get('/add-item', function(req, res) {
	res.sendFile(htmlPath + "add-item.html");
});

//An API which processes adding item information.
app.post('/add-item-process', upload.single('itemImage'), function(req, res) {
	console.log("Form received!");
	// req.file is the name of your file in the form above, here 'uploaded_file'
	// req.body will hold the text fields, if there were any 
	console.log(req.file, req.body);
	console.log(req.body.itemName);

	//Handle other file types and limit the maximum file size.
	file.renameSync('./html/uploads/' + req.file.filename, './html/uploads/' + req.file.filename + '.jpg');

	supplier.addItem(req.body, './html/uploads/' + req.file.filename + '.jpg', req.session.userId, function(result){
		res.sendFile(htmlPath + result + '.html');
	});
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Supplier
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*app.get('/sign-up-supplier', function(req, res) {
	res.sendFile(htmlPath + "sign-up-supplier.html");
});

app.post('/sign-up-supplier-process', function(req, res) {
	supplier.signUp(req.body, function(result){
		res.sendFile(htmlPath + result + '.html');
		//res.end(result);
		//Send result data to Ranga's front end using REST (JSON).
	});
});*/

//This function delivers a page with a data table.
app.get('/view-suppliers', function(req, res) {
	res.sendFile(htmlPath + "view-suppliers.html");
});

//An API which sends supplier data to the caller.
app.get('/view-suppliers-visitor-process', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	//Add session authentication as well.
	supplier.showSuppliersVisitor(function (result){
		console.log("**************Showing all suppliers>");
		console.log(result);
		res.json(result);	
	});
});

//An API which sends supplier data to the caller.
app.get('/view-suppliers-customer-process', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	//Add session authentication as well.

	//Check if session data exists.
	if(typeof req.session.city== 'undefined'){
		res.json({'result' : 'User not logged in!'});
		return;
	}

	supplier.showSuppliersCustomer(req.session.city, function (result){
		console.log("**************Showing suppliers in the nearest city>");
		console.log(result);
		res.json(result);	
	});
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Handle invalid URLs.
app.all('*', function(req, res) {
    	res.send('Bad request');
});

//Starts a nodejs server instance.
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

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
