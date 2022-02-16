//Includes.
const express = require('express');
const bodyParser = require("body-parser");
const path= require('path');
const file = require('fs');

//////////////////////////////////////////////////////////////////////////
//For image uploads
////////////////////////////////////////////////////////////////////////// 
const multer  = require('multer');
const uploadItemImage = multer({ dest: './Medi2Door/assets/images/items' });
const uploadStoreImage = multer({ dest: './Medi2Door/assets/images/pharmacies' });
//////////////////////////////////////////////////////////////////////////

const customer = require('./js/customer.js');
const supplier = require('./js/supplier.js');

var session = require('express-session');
const cookieParser = require("cookie-parser");
const { Session } = require('express-session');
const { serialize } = require('v8');
const { error } = require('console');

//Global constants.
const app = express();
const port = 3000;
const sessionTime= 1000* 60* 60;
const sessionSecret= 'sepprojectsessionsecret'

//Path preparation.
const htmlPath= path.join(__dirname, '/html/');
const storeImagePath= path.join(__dirname, '/Medi2Door/assets/images/pharmacies/'); 
const itemImagePath= path.join(__dirname, '/Medi2Door/assets/images/items/'); 
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
app.set('view engine', 'ejs')

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Common functions for the customer and the supllier.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function delivers the home page.
/*app.get('/', function (req, res){
	//ejs 
	res.render('Index.ejs', { message :'', valmessage: ''})
	//res.sendFile(rangaFrontEnd + "Index.html");
	//Below code is as a reference for session checking.
	/*if(req.session.loggedIn== 'true'){
		//Send session data to Ranga's front end using REST (JSON).
		res.send("Welcome " + req.session.firstName + " " + req.session.email);
	}else{
		res.sendFile(htmlPath + "index.html");
	}*/

app.get('/', function(req, res){
  res.render('Index.ejs', { userFName: req.session.firstName});
});

app.get('/index', function (req, res){
	//ejs 
	res.render('Index.ejs', { userFName: req.session.firstName});
});

app.get('/login', function (req, res){
	//ejs 
	res.render('Login.ejs', { message :'', valmessage: '', loginerror: ''})
});

app.get('/login-validate', function (req, res, next){
	res.render('Login.ejs', { message : 'Invalid Credentials!', valmessage : '', loginerror: ''});

})

app.get('/register-supplier-validate', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : 'Please enter NMRA ID, Pharmasist ID and Description!', loginerror: ''});
})

app.get('/registration-error', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : 'Error in creating account!', loginerror: ''});
})

app.get('/my-account-error', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : '', loginerror: 'You have not logged in!'});
})

//CUSTOMER EDIT PROFILE
app.get('/my-account-customer', function (req, res, next){
	console.log("In my-account-customer")
	console.log(req.session.firstName)
	res.render('Account-Customer.ejs', { userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.street,
		userCity: req.session.city,
		userEmail: req.session.email,
		userPassword: req.session.password,
		valmessage: ''});
})

app.get('/customer-update-validate-success', function (req, res, next){
	res.render('Account-customer.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.userAddress,
		userCity: req.session.userCity,
		userEmail: req.session.email,
		userPassword :req.session.password,
		valmessage : "success"});

})

app.get('/customer-update-validate-fail', function (req, res, next){
	res.render('Account-customer.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.userAddress,
		userCity: req.session.userCity,
		userEmail: req.session.email,
		userPassword :req.session.password,
		valmessage : "fail"});

})


//SUPPLIER EDIT PROFILE
app.get('/my-account-supplier', function (req, res, next){
	console.log("In my-account-supplier")
	console.log(req.session.firstName)
	res.render('Account-Supplier.ejs', { userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.street,
		userCity: req.session.city,
		userEmail: req.session.email,
		userPassword: req.session.password,
		userStoreDesc: req.session.storeDescription,
		userNMRA: req.session.nmraRegistration,
		userPharmID: req.session.pharmacistRegistration,
		valmessage: ''});
})

app.get('/supplier-update-supplier-success', function (req, res, next){
	res.render('Account-Supplier.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.userAddress,
		userCity: req.session.userCity,
		userEmail: req.session.email,
		userPassword :req.session.password,
		userStoreDesc: req.session.storeDescription,
		userNMRA: req.session.nmraRegistration,
		userPharmID: req.session.pharmacistRegistration,
		valmessage : "success"});

})

app.get('/supplier-update-validate-fail', function (req, res, next){
	res.render('Account-Supplier.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.userAddress,
		userCity: req.session.userCity,
		userEmail: req.session.email,
		userPassword :req.session.password,
		userStoreDesc: req.session.storeDescription,
		userNMRA: req.session.nmraRegistration,
		userPharmID: req.session.pharmacistRegistration,
		valmessage : "fail"});

})


/*
//This function also delivers the home page.
app.get('/Index.html', function (req, res){
	res.sendFile(rangaFrontEnd + "Index.html");
});*/

/*
//This function also delivers the log in page.
app.get('/Login.html', function (req, res){
	res.sendFile(rangaFrontEnd + "Login.html");
});*/

//This function processes the sign up form.
app.post("/sign-up-process", function(req, res){
	console.log('**************Received sign up form data>');
	console.log(req.body);

	//Bad input sanitization.
    /* Handling form validation in the Login.ejs file
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
	req.body.nmraRegistration== '' || req.body.pharmacistRegistration== '') || req.body.storeDescription== ''){
		res.json({'result' : 'Fields are empty!'});
		return;
	}

	//Check if passwords are matching.
	if(req.body.password != req.body.confirmPassword){
		res.json({'result' : 'Passwords do not match!'});
		return;
	}
	*/

	//CUSTOMER
	if(req.body.userType== 'customer'){
		//Save data in the database.
		customer.signUp(req.body, function(result){
			//res.sendFile(htmlPath + result + '.html');
			//res.end(result);
			//res.json({'result' : result});
			//return;
			console.log(result)
			if(result == "success"){
				//res.sendFile(htmlPath + 'success.html');
				res.redirect("/index")
			}
			else {
				res.redirect('/registration-error')
			}
			});	
	}
	//SUPPLIER
	else if(req.body.userType== 'supplier')
		{
		//Checking additional supplier fields
		if(req.body.nmraRegistration== '' || req.body.pharmacistRegistration== '' || req.body.storeDescription== ''){
			res.redirect('/register-supplier-validate')
		}
		else {
		//Save data in the database.
		supplier.signUp(req.body, function(result){
			console.log(result)
			if(result = "success"){
				res.sendFile(htmlPath + 'success.html');
			}
			else{
				res.redirect('/registration-error')
			}
			});	
	}
	}
});


//This function processes the login form.
app.post("/sign-in-process", function(req, res){
	console.log('**************Received sign in form data>');
	console.log(req.body);
    /* Handling form validation in the Login.ejs file
	//Check the account type using the form dropdown.
	if(req.body.email== '' || req.body.password== ''){
		res.json({'result' : 'Fields are empty!'});
		return;
	}

	if(req.body.userType== 'null'){
		res.json({'result' : 'Select user type!'});
		return;
	}
	*/

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
			req.session.password = result.password;

			res.locals.userFname = result.firstName;
			//res.sendFile(htmlPath + 'success.html');
			//res.redirect('/');
			res.redirect('/index');


		}else {
			req.session.loggedIn = "false";
			console.log("**************Invalid credentials!");
			res.redirect('/login-validate');
			//res.json({'result' : 'Invalid credentials!'});
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
				req.session.password = result.password;
				req.session.nmraRegistration = result.nmraRegistration;
				req.session.pharmacistRegistration = result.pharmacistRegistration;
				req.session.storeDescription = result.storeDescription;
				req.session.storeImage= result.storeImage;
	
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
	///////////////////////////This is ASYNC! Needs a callback.
	req.session.destroy();
	console.log("**************Logged out!");
    res.redirect('/');
});

/*
//This function displays the account settings page for customers.
app.get('/Account.html', function (req, res){
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.json({'status' : 'User not logged in'});	
		return;

	}else if (req.session.userType== 'customer'){
		res.sendFile(rangaFrontEnd + "Account-Customer.html");
		return;

	}else if (req.session.userType== 'supplier'){
		res.sendFile(rangaFrontEnd + "Account-Supplier.html");
		return;
	} 
});
*/

app.get('/my-account', function (req, res){
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else if (req.session.userType== 'customer'){
		console.log("**************Customer MyAccount");
		res.redirect('/my-account-customer')

	}else if (req.session.userType== 'supplier'){
		res.sendFile(rangaFrontEnd + "Account-Supplier.html");
		return;
	} 
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Customer
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//This function processes the form to update customer profile data.

app.post('/edit-customer-process', function(req, res) {
	console.log('**************Received edit customer profile form data>');
	console.log(req.body);

	if(req.body.password == '' && req.body.confirmPassword.length == '' ){
			customer.editProfile(req.body, req.session.userId, req.session.password, function(result){
				console.log(result)
				if(result == "success"){
					res.redirect('/customer-update-validate-success')
				}
				else {
					updtStatus = "fail";
					res.redirect('/customer-update-validate-fail')
				}
		});
	} else if (req.body.currentPassword!= ''){
		//Check if the current stored password matches the entered current password.
		if(req.body.currentPassword != req.session.password){
			//res.json({'result' : 'Wrong current password!'});
			//return;
			console.log('Wrong current password!')
			res.redirect('/customer-update-validate-fail')
		}

		else if(req.body.password != req.body.confirmPassword){
			console.log('Passwords do not match!')
			res.redirect('/customer-update-validate-fail')
		}

		else {
			customer.editProfile(req.body, req.session.userId, req.body.password, function(result){
				console.log(result)
				if(result == "success"){
					res.redirect('/customer-update-validate-success')
				}
				else {
					updtStatus = "fail";
					res.redirect('/customer-update-validate-fail')
				}
		});
	}}

});

/*
app.post('/edit-customer-process', function(req, res) {
	console.log('**************Received edit customer profile form data>');
	console.log(req.body);

	//Check if session data exists.
	/* Is not need as this check is perfromed in the index/login pages
	if(typeof req.session.userId== 'undefined'){
		res.json({'result' : 'User not logged in!'});
		return;
	}*/

	//Sanitize form data here.
	//Check if the new passwords are the same.
	//Check if the user is trying to use an occupied email. 
	//Check for empty fields if the user type is 'supplier'.
	/*Handled in form level
	if(req.body.email== '' || req.body.firstName== '' || req.body.lastName== '' || 
	req.body.street== '' || req.body.city== 'null'){
		res.json({'result' : 'Fields are empty!'});
		return;
	}
	
	
	//Check if user wants to change the password. If a user has typed something, consider it as a trigger.
	if(req.body.currentPassword!= ''){
		//Check if the current stored password matches the entered current password.
		if(req.body.currentPassword != req.session.password){
			//res.json({'result' : 'Wrong current password!'});
			//return;
			console.log('Wrong current password!')
			res.redirect('/customer-details-validate-pwerror')
		}

		if(req.body.password!= req.body.confirmPassword== ''){
			res.json({'result' : 'New passwords do not match!'});
			return;
		}

		customer.editProfile(req.body, req.session.userId, req.body.password, function(result){
			res.json({'result' : result});
		});

	}else{
		//If the user does not want to change the password.
		customer.editProfile(req.body, req.session.userId, req.session.password, function(result){
			res.json({'result' : result});
		});
	}*
});*/



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

//An API which sends session data to the caller (can be used to render user data and populate forms).
app.get('/get-session', function(req, res) {

	var object;

	if((typeof req.session.userId== 'undefined') || req.session.loggedIn== 'false'){
		res.json({'loggedIn': 'false'});
		return;

	}else if(req.session.loggedIn== 'true' && (req.session.userType== 'customer')){
		object= {loggedIn: req.session.loggedIn, userId: req.session.userId, userType: req.session.userType,
			email: req.session.email, firstName: req.session.firstName, lastName: req.session.lastName, 
			street: req.session.street, city: req.session.city, password: req.session.password}

	}else if(req.session.loggedIn== 'true' && req.session.userType== 'supplier'){
		object= {loggedIn: req.session.loggedIn, userId: req.session.userId, userType: req.session.userType,
			email: req.session.email, firstName: req.session.firstName, lastName: req.session.lastName, 
			street: req.session.street, city: req.session.city, password: req.session.password,
			nmraRegistration: req.session.nmraRegistration, pharmacistRegistration: req.session.pharmacistRegistration, 
			storeDescription: req.session.storeDescription, storeImage: req.session.storeImage}
	}
	
	console.log(object);
	res.json(object);
})

//Function which might help Krishni for intergration. Same as the above but returns a JS obect rather than returning
//a JSON response. This object can be returned to the front end using EJS res.render() if using EJS. 
function getSession(){

	var object;

	if((typeof session.userId== 'undefined') || session.loggedIn== 'false'){
		object= {'status': 'User not logged in!'}

	}else if(session.loggedIn== 'true' && (session.userType== 'customer')){
		object= {loggedIn: session.loggedIn, userId: session.userId, userType: session.userType,
			email: session.email, firstName: session.firstName, lastName: session.lastName, 
			street: session.street, city: session.city, password: session.password}

	}else if(session.loggedIn== 'true' && session.userType== 'supplier'){
		object= {loggedIn: session.loggedIn, userId: session.userId, userType: session.userType,
			email: session.email, firstName: session.firstName, lastName: session.lastName, 
			street: session.street, city: session.city, password: session.password,
			nmraRegistration: session.nmraRegistration, pharmacistRegistration: session.pharmacistRegistration, 
			storeDescription: session.storeDescription, storeImage: session.storeImage}
	}
	
	console.log(object);
	return object;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Item
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function delivers the add item form.
app.get('/add-item', function(req, res) {
	res.sendFile(htmlPath + "add-item.html");
});

//An API which processes adding item information.
app.post('/add-item-process', uploadItemImage.single('itemImage'), function(req, res) {
	console.log("Form received!");
	// req.file is the name of your file in the form above, here 'uploaded_file'
	// req.body will hold the text fields, if there were any 
	console.log(req.file, req.body);
	console.log(req.body.itemName);

	//Handle other file types and limit the maximum file size.
	file.renameSync(itemImagePath + req.file.filename, itemImagePath + req.file.filename + '.jpg');

	supplier.addItem(req.body, itemImagePath + req.file.filename + '.jpg', req.session.userId, function(result){
		res.sendFile(htmlPath + result + '.html');
	});
});

//Test function to fetch items in the cart.
app.get('/get-cart', function(req, res) {
	console.log('**************Fetching items in the cart>');

	//Check if session array exists.
	if(session.cartItemNumber){

		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var array= [];	//Array of objects.

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Code for debugging.
			//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
			//console.log('Loop Item ID: ' + session.cartItemId[x]);
			//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemQuantity : ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			array.push(data); 
		});	

		//Send the object array to the caller as JSON.
		res.json(array);

	}else{
		res.json({'status': 'Cart empty'});
	}
});

//Test function to add items to the cart.
app.get('/add-to-cart', function(req, res) {
	console.log('**************Item details received>');

	//Check if session array exists.
	if(session.cartItemNumber){
		//Add new item.
		session.itemCount++;
		session.cartItemNumber.push(session.itemCount);
		session.cartItemId.push(1); //Values must come from the request body.
		session.cartItemQuantity.push(5); //Values must come from the request body.
		//session.itemCount++;

		//Display items for debugging.
		var i= 0;
		console.log('**************Displaying cart session arrays>');
		session.cartItemNumber.forEach(element => {
			console.log('Item Number: ' + element);
			console.log('Item ID: ' + session.cartItemId[i]);
			console.log('Item Quantity: ' + session.cartItemQuantity[i]);
			i++;
		});	

	}else{
		//Create session array if it doesn't exist.
		session.itemCount= 0;	//To keep track of 
		session.cartItemNumber= [];
		session.cartItemId= [];
		session.cartItemQuantity= [];

		//Add the initial item.
		session.cartItemNumber.push(session.itemCount);
		session.cartItemId.push(1);	//Values must come from the request body.
		session.cartItemQuantity.push(5);	//Values must come from the request body.
		//session.itemCount++;

		console.log('**************New cart session arrays created and initialized>');

		//Display items for debugging.
		var i= 0;
		console.log('**************Displaying cart session arrays>');
		session.cartItemNumber.forEach(element => {
			console.log('Item Number: ' + element);
			console.log('Item ID: ' + session.cartItemId[i]);
			console.log('Item Quantity: ' + session.cartItemQuantity[i]);
			i++;
		});	
	}

	//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

	var x= 0;	//Incrementer.
	var array= [];	//Array of objects.

	//Loop through all elements in the cart session array.
	session.cartItemNumber.forEach(element => {

		//Code for debugging.
		//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
		//console.log('Loop Item ID: ' + session.cartItemId[x]);
		//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

		//Create the object.
		var data= {cartItemNumber : '', cartItemId : '', cartItemQuantity : ''}

		//Assign session values to the object.
		data.cartItemNumber= session.cartItemNumber[x];
		data.cartItemId = session.cartItemId[x];
		data.cartItemQuantity= session.cartItemQuantity[x];
		x++; //Increment to the next set of session elements.

		//Push the object into an object array
		array.push(data); 
	});	

	//Send the object array to the caller as JSON.
	res.json(array);
});

//Test function to remove items from the cart.
app.get('/remove-from-cart', function(req, res) {
	if(session.cartItemNumber){

		//Handle if itemCount is 0.
		if(session.itemCount== 0){
			session.itemCount= null;
			session.cartItemNumber= null;
			session.cartItemId= null;
			session.cartItemQuantity= null;
			res.json({'status': 'Cart empty'});
			return;
		}

		//Remove item.
		console.log('**************Removing item from cart session arrays>');
		var cartItemNumber= session.itemCount;
		session.cartItemNumber.splice(cartItemNumber, cartItemNumber);
		session.cartItemId.splice(cartItemNumber, cartItemNumber);
		session.cartItemQuantity.splice(cartItemNumber, cartItemNumber);
		session.itemCount= session.itemCount- 1;

		//Display items.
		var i= 0;
		console.log('**************Displaying cart session arrays after removal>');
		session.cartItemNumber.forEach(element => {
			console.log('Item Number: ' + element);
			console.log('Item ID: ' + session.cartItemId[i]);
			console.log('Item Quantity: ' + session.cartItemQuantity[i]);
			i++;
		});	


		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var array= [];	//Array of objects.

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Code for debugging.
			//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
			//console.log('Loop Item ID: ' + session.cartItemId[x]);
			//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemQuantity : ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			array.push(data); 
		});	

		//Send the object array to the caller as JSON.
		res.json(array);

	}else{
		console.log('**************No cart sessions!');
		res.json({'status': 'Cart empty'});
	}
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Supplier
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
//This function processes the form to update supplier profile data.
app.post('/edit-supplier-process', uploadStoreImage.single('storeImage'), function(req, res) {

	console.log('**************Received edit supplier profile form data>');
	// req.file is the name of your file in the form above, here 'uploaded_file'
	// req.body will hold the text fields, if there were any 
	console.log(req.file, req.body);
	console.log(req.body.itemName);

	var storeImageFileName;

	//Check if an image file is actually uploaded or not.
	if(typeof req.file.filename== 'undefined' || req.file.filename== null || req.file.filename== ''){
		storeImageFileName= 'null';
	}else{
		//Handle other file types and limit the maximum file size.
		file.renameSync(storeImagePath + req.file.filename, storeImagePath + req.file.filename + '.jpg');

		//Format the image file path name to be saved in the database.
		storeImageFileName= storeImagePath + req.file.filename + '.jpg';
	}

	//Check if session data exists.
	if(typeof req.session.userId== 'undefined'){
		res.json({'result' : 'User not logged in!'});
		return;
	}

	//Sanitize form data here.
	//Check if the new passwords are the same.
	//Check if the user is trying to use an occupied email. 
	//Check for empty fields if the user type is 'supplier'.
	if(req.body.email== '' || req.body.firstName== '' || req.body.lastName== '' || 
	req.body.street== '' || req.body.city== 'null' || req.body.nmraRegistration== '' || req.body.pharmacistRegistration== '' || 
	req.body.storeDescription== ''){
		res.json({'result' : 'Fields are empty!'});
		return;
	}

	//Check if user wants to change the password. If a user has typed something, consider it as a trigger.
	if(req.body.currentPassword!= ''){
		//Check if the current stored password matches the entered current password.
		if(req.body.currentPassword != req.session.password){
			res.json({'result' : 'Wrong current password!'});
			return;
		}

		if(req.body.password!= req.body.confirmPassword== ''){
			res.json({'result' : 'New passwords do not match!'});
			return;
		}

		supplier.editProfile(req.body, req.session.userId, req.body.password, storeImageFileName, function(result){
			res.json({'result' : result});
		});

	}else{
		//If the user does not want to change the password. Use the current password saved in the session.
		supplier.editProfile(req.body, req.session.userId, req.session.password, storeImageFileName, function(result){
			res.json({'result' : result});
		});
	}
});
*/


app.post('/edit-supplier-process', function(req, res) {
	console.log('**************Received edit supplier profile form data>');
	console.log(req.body);

	if(req.body.password == '' && req.body.confirmPassword.length == '' ){
			customer.editProfile(req.body, req.session.userId, req.session.password, function(result){
				console.log(result)
				if(result == "success"){
					res.redirect('/supplier-update-validate-success')
				}
				else {
					updtStatus = "fail";
					res.redirect('/supplier-update-validate-fail')
				}
		});
	} else if (req.body.currentPassword!= ''){
		//Check if the current stored password matches the entered current password.
		if(req.body.currentPassword != req.session.password){
			//res.json({'result' : 'Wrong current password!'});
			//return;
			console.log('Wrong current password!')
			res.redirect('/supplier-update-validate-fail')
		}

		else if(req.body.password != req.body.confirmPassword){
			console.log('Passwords do not match!')
			res.redirect('/supplier-update-validate-fail')
		}

		else {
			customer.editProfile(req.body, req.session.userId, req.body.password, function(result){
				console.log(result)
				if(result == "success"){
					res.redirect('/supplier-update-validate-success')
				}
				else {
					updtStatus = "fail";
					res.redirect('/supplier-update-validate-fail')
				}
		});
	}}

});

//This function delivers a page with a data table.
app.get('/view-suppliers', function(req, res) {
	res.sendFile(htmlPath + "view-suppliers.html");
});


//An API which sends supplier data to the caller.
app.get('/view-suppliers-process', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	//Add session authentication as well.

	//Check if session data exists. Show unlocalized data if user is not logged in.
	if(typeof req.session.city== 'undefined'){
		supplier.showSuppliersVisitor(function (result){
			console.log("**************Showing all suppliers>");
			console.log(result);
			res.json(result);	
			return;
		});

	}else{
		//Show localized data if user is logged in.
		supplier.showSuppliersCustomer(req.session.city, function (result){
			console.log("**************Showing suppliers in the nearest city>");
			console.log(result);
			res.json(result);	
		});
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Handle invalid URLs.
app.all('*', function(req, res) {
    	res.send('Bad request');
});

//Starts a nodejs server instance.
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
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
