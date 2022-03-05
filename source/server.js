//Includes.
const express = require('express');
const bodyParser = require("body-parser");
const path= require('path');
const file = require('fs');

//////////////////////////////////////////////////////////////////////////
//For image uploads
////////////////////////////////////////////////////////////////////////// 
const multer  = require('multer');
const uploadItemImage = multer({ dest: './views/images/items' });
const uploadStoreImage = multer({ dest: './views/images/pharmacies' });
const uploadPrescriptionImage = multer({ dest: './views/images/prescriptions' });
const uploadPrescriptionImageTemporary = multer({ dest: './views/images/prescriptions/temp' });
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

const storeImagePath= path.join(__dirname, '/views/images/pharmacies/'); 
const newStoreImagePath= 'images/pharmacies/';

const itemImagePath= path.join(__dirname, '/views/images/items/'); 
const newItemImagePath= 'images/items/';

const prescriptionImagePath= path.join(__dirname, '/views/images/prescriptions/'); 
const newPrescriptionImagePath= 'images/prescriptions/';

const prescriptionImagePathTemporary= path.join(__dirname, '/views/images/prescriptions/temp/'); 
const newPrescriptionImagePathTemporary= 'images/prescriptions/temp/';

const rangaFrontEnd= path.join(__dirname, '/Medi2Door/');
const krishniViews= path.join(__dirname, '/views/');

//Use declarations.
//For session management. Please change the session string.
app.use(session({
	secret: sessionSecret,
	cookie: { maxAge: sessionTime },
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(__dirname + '/Medi2Door/'));	//Use Ranga's static resources.
app.use(express.static(__dirname + '/views/'));	//Use Krishni's dynamic resources.
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Routes for serving the front end.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', function(req, res){
	//Check if user is logged in
	//Show all supplier data if user is not logged in.
	if(typeof req.session.city== 'undefined'){
		supplier.showSuppliersVisitor(function (result){
			console.log("**************Showing all suppliers>");
			console.log(result);
			res.render(krishniViews + 'Index.ejs', { userFName: '', suppliers: result});
		});

	}else{
		//Show localized data if user is logged in.
		supplier.showSuppliersCustomer(req.session.city, function (result){
			console.log("**************Showing suppliers in the nearest city>");
			console.log(result);
			res.render(krishniViews + 'Index.ejs', { userFName: req.session.firstName, suppliers: result});
		});
	}
});

//INDEX ROUTE: HOME
app.get('/index', function (req, res){
	//Check if user is logged in
	//Show all supplier data if user is not logged in.
	if(typeof req.session.city== 'undefined'){
		supplier.showSuppliersVisitor(function (result){
			console.log("**************Showing all suppliers>");
			console.log(result);
			res.render('Index.ejs', { userFName: '', suppliers: result});
		});

	}else{
		//Show localized data if user is logged in.
		supplier.showSuppliersCustomer(req.session.city, function (result){
			console.log("**************Showing suppliers in the nearest city>");
			console.log(result);
			res.render('Index.ejs', { userFName: req.session.firstName, suppliers: result});
		});
	}
});

//LOGIN
app.get('/login', function (req, res){
	res.render('Login.ejs', { message :'', valmessage: '', loginerror: ''})
});

app.get('/login-validate', function (req, res, next){
	res.render('Login.ejs', { message : 'Invalid Credentials!', valmessage : '', loginerror: ''});

});

//REGISTER USER
app.get('/register-supplier-validate', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : 'Please enter NMRA ID, Pharmasist ID and Description!', loginerror: ''});
});

app.get('/registration-error', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : 'Error in creating account!', loginerror: ''});
});

app.get('/registration-success', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : 'Registration successful!', loginerror: ''});
});

app.get('/my-account-error', function (req, res, next){
	res.render('Login.ejs', { message :'', valmessage : '', loginerror: 'You have not logged in!'});
});

//CUSTOMER EDIT PROFILE routes.
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
});

app.get('/customer-update-validate-success', function (req, res, next){
	console.log("**************Updating session variables after a profile update>");

	//Check if the session exists.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')
	}

	//Pull the updated data from the database and update the session variables.
	customer.getProfileData(req.session.userId, function (result){
		console.log(result);

		if(result!= 'failure'){
			//Update session variables.
			req.session.email = result.email;
			req.session.firstName = result.firstName;
			req.session.lastName = result.lastName;
			req.session.street = result.street;
			req.session.city = result.city;
			req.session.password = result.password;
		}
		
		res.render('Account-customer.ejs', {userFName: req.session.firstName,
			userLName: req.session.lastName,
			userAddress: req.session.street,
			userCity: req.session.city,
			userEmail: req.session.email,
			userPassword :req.session.password,
			valmessage : "success"});
	});
});

app.get('/customer-update-validate-fail', function (req, res, next){
	res.render('Account-customer.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.street,
		userCity: req.session.city,
		userEmail: req.session.email,
		userPassword :req.session.password,
		valmessage : "fail"});
});

//SUPPLIER EDIT PROFILE routes.
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
		userStoreImage: req.session.storeImage,
		valmessage: ''});
});

app.get('/supplier-update-validate-success', function (req, res, next){
	console.log("**************Updating session variables after a profile update>");

	//Check if the session exists.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')
	}

	//Pull the updated data from the database and update the session variables.
	supplier.getProfileData(req.session.userId, function (result){
		console.log(result);

		if(result!= 'failure'){
			//Update session variables.
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
		}

		res.render('Account-Supplier.ejs', {userFName: req.session.firstName,
			userLName: req.session.lastName,
			userAddress: req.session.street,
			userCity: req.session.city,
			userEmail: req.session.email,
			userPassword :req.session.password,
			userStoreDesc: req.session.storeDescription,
			userNMRA: req.session.nmraRegistration,
			userPharmID: req.session.pharmacistRegistration,
			userStoreImage: req.session.storeImage,
			valmessage : "success"});
		});
});

app.get('/supplier-update-validate-fail', function (req, res, next){
	res.render('Account-Supplier.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.street,
		userCity: req.session.city,
		userEmail: req.session.email,
		userPassword :req.session.password,
		userStoreDesc: req.session.storeDescription,
		userNMRA: req.session.nmraRegistration,
		userPharmID: req.session.pharmacistRegistration,
		userStoreImage: req.session.storeImage,
		valmessage : "fail"});

});

//Redirected to this route after an item is added to cart
app.get('/view-supplier-products-redirect', function (req, res){
	console.log("**************Showing the selected supplier's data and items>");
	console.log(req.body);

	//Get supplier data first.
	//////////Supplier ID is hardcoded for testing.
	//supplier.getSupplierData(req.body.supplierId, function (resultSupplier)
	supplier.getSupplierData(session.supplieridpharm, function (resultSupplier){
		console.log("**************Showing the selected supplier's profile data>");
		console.log(resultSupplier);

		//Then get the respective supplier's items list.
		//supplier.getItemsList(req.body.supplierId, req.body.prescribed, request.body.itemCategory, function (resultItems)
		supplier.getItemsList(session.supplieridpharm, 'false', 'null', function (resultItems){
			console.log("**************Showing the selected supplier's items>");
			console.log(resultItems);

			//Get Category Counts
			var miscCount = 0
			var mediCount = 0
			var grocCount = 0
			var allCount = resultItems.length
			let catCount = new Object();

			for(var i=0; i < resultItems.length; i++)
			{
				if(resultItems[i].category == "Medicine")
				{
					mediCount += 1;
				} else if (resultItems[i].category == "Grocery")
				{
					grocCount += 1;
				} else 
				{
					miscCount += 1;
				}
			}

			catCount.medicine = mediCount;
			catCount.groceries = grocCount;
			catCount.misc = miscCount;
			catCount.all = allCount;
			console.log(catCount)

			console.log("price in redirect", session.totalPrice)

			res.render('Pharmacy.ejs', { userFName: session.userfirstname,  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, totalPrice: session.totalPrice, message: "Item added to cart!"});	
			
		});
	});
	
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Common functions (back end)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
			console.log(result)

			if(result == "success"){
				res.redirect("/registration-success")
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
			if(result == "success"){
				res.redirect('/registration-success')
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

			//recreating as they are not accessible 
			session.userfirstname = result.firstName;
			session.userid = result.userId;
			session.loggedstatus = "true";

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
	
				//res.sendFile(htmlPath + 'success.html');
				res.redirect('/my-account-supplier');
				
	
			}else{
				req.session.loggedIn = "false";
				console.log("**************Invalid credentials!");
				//res.json({'result' : 'Invalid credentials!'});
				//res.sendFile(htmlPath + 'invalid-credentials.html');
				res.redirect('/login-validate');
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

//This functions routes to the proper edit profile page.
app.get('/my-account', function (req, res){
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else if (req.session.userType== 'customer'){
		console.log("**************Customer MyAccount");
		res.redirect('/my-account-customer');

	}else if (req.session.userType== 'supplier'){
		console.log("**************Supplier MyAccount");
		res.redirect('/my-account-supplier');
	} 
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Customer functions (back end)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//This function processes the form to update customer profile data.
app.post('/edit-customer-process', function(req, res) {
	console.log('**************Received edit customer profile form data>');
	console.log(req.body);

	//If the conditions are not met to trigger a password change.
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

	//If the conditions are met to trigger a password change.	
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
//Cart functions (back end)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/cart', function (req, res){
	if(session.cartItemNumber){

		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var cartItems= []; //Array of cart item objects.
		var objects= [];
		var totalPrice= 0;
		var prescribed= 'false';

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
			cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
			cartItemImage: '', cartItemSupplierId: '', cartItemSubTotal: ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemCategory= session.cartItemCategory[x];
			data.cartItemName= session.cartItemName[x];
			data.cartItemDescription = session.cartItemDescription[x];
			data.cartItemPrescribed= session.cartItemPrescribed[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			data.cartItemUnitPrice= session.cartItemUnitPrice[x];
			data.cartItemImage = session.cartItemImage[x];
			data.cartItemSupplierId = session.cartItemSupplierId[x];

			//Calculating sub total price.
			var subtotal = 0;
			subtotal= session.cartItemQuantity[x] * session.cartItemUnitPrice[x];
			data.cartItemSubTotal = subtotal;

			//Calculating total price.
			totalPrice += subtotal;
			session.totalPrice = totalPrice

			//Check for prescribed items. Checking this once is enough. 
			if(session.cartItemPrescribed== 'true'){
				prescribed= 'true';
			}

			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			cartItems.push(data); 
		});	

		console.log(objects);

		if(prescribed == 'false'){
			//cartEmpty: 0 => Cart not empty
			res.render('Cart.ejs', {cartItems: cartItems, totalPrice: totalPrice, reqPrescription: 0, isCartEmpty: 0})
		}
		else{
			res.render('Cart.ejs', {cartItems: cartItems, totalPrice: totalPrice, reqPrescription: 1, isCartEmpty: 0})
		}
		

	}else{
		res.json({'status': 'Cart empty'});
	}
	
});

//Cart Empty Redirect
app.get('/cart-empty', function (req, res){
	res.render('Cart.ejs', {cartItems: {}, totalPrice: 0, reqPrescription: 0, isCartEmpty: 1})
});

//Test function to fetch items in the cart.
/*
app.post('/get-cart', function(req, res) {
	console.log('**************Fetching items in the cart>');

	//Check if session array exists.
	if(session.cartItemNumber){

		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var array= [];	//Array of cart item objects.
		var objects= [];
		var totalPrice= 0;
		var prescribed= 'false';

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Code for debugging.
			//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
			//console.log('Loop Item ID: ' + session.cartItemId[x]);
			//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
			cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
			cartItemImage: '', cartItemSupplierId: ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemCategory= session.cartItemCategory[x];
			data.cartItemName= session.cartItemName[x];
			data.cartItemDescription = session.cartItemDescription[x];
			data.cartItemPrescribed= session.cartItemPrescribed[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			data.cartItemUnitPrice= session.cartItemUnitPrice[x];
			data.cartItemImage = session.cartItemImage[x];
			data.cartItemSupplierId = session.cartItemSupplierId[x];

			//Calculating total price.
			totalPrice= totalPrice + (session.cartItemQuantity * session.cartItemUnitPrice);

			//Check for prescribed items. Checking this once is enough. 
			if(session.cartItemPrescribed== 'true'){
				prescribed= 'true';
			}

			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			array.push(data); 
		});	

		objects.push(array);
		objects.push({'totalPrice': totalPrice});
		objects.push({'prescribed': prescribed});

		//Send the object array to the caller as JSON.
		res.json(objects);

	}else{
		res.json({'status': 'Cart empty'});
	}
});
*/

//Test function to add items to the cart.
//The 'add item to cart' request must send the required parameters.
app.post('/add-to-cart', function(req, res) {
	console.log('**************Item details received for addition to cart>');
	console.log(req.body);

	//Check if session array exists.
	if(session.cartItemNumber){
		
		//Add new item.
		session.itemCount++;
		session.cartItemNumber.push(session.itemCount);	

		//Values must come from the request body.
		session.cartItemId.push(req.body.itemCode);	
		session.cartItemCategory.push(req.body.itemCategory);
		session.cartItemName.push(req.body.itemName);
		session.cartItemDescription.push(req.body.itemDescription);
		session.cartItemPrescribed.push(req.body.itemPrescribed);
		session.cartItemQuantity.push(req.body.itemQuantity);
		session.cartItemUnitPrice.push(req.body.itemUnitPrice);
		session.cartItemImage.push(req.body.itemImage);
		session.cartItemSupplierId.push(req.body.itemSupplierId);
		//session.itemCount++;

		//Display items for debugging.
		var i= 0;
		console.log('**************Displaying cart session arrays>');
		session.cartItemNumber.forEach(element => {
			console.log('Item Number: ' + element);
			console.log('Item ID: ' + session.cartItemId[i]);
			console.log('Item Name: ' + session.cartItemName[i]);
			console.log('Item Quantity: ' + session.cartItemQuantity[i]);
			i++;
		});	

		/*//calculate price
		var totalPrice= 0;
		totalPrice= totalPrice + (session.cartItemQuantity * session.cartItemUnitPrice);
		session.totalPrice = totalPrice

		//redirect to page
		supplier.getItem(req.body.itemCode, function(result){
			res.render('ProductDetails.ejs', { totalPrice: session.totalPrice, userFName: session.userfirstname, ItemDetails: result});
		});*/

	}else{
		//Create session arrays if they don't exist (ininitializing the cart).
		session.itemCount= 0;	//To keep track of the number of items in the session arrays (incrementer).
		session.cartItemNumber= []; //To keep track of the number of items in the session arrays (index).

		session.cartItemId= [];	//Item code.
		session.cartItemCategory= [];
		session.cartItemName= [];
		session.cartItemDescription= [];
		session.cartItemPrescribed= [];
		session.cartItemQuantity= [];
		session.cartItemUnitPrice= [];
		session.cartItemImage= [];
		session.cartItemSupplierId= [];

		//Add the initial item.
		session.cartItemNumber.push(session.itemCount);

		//Values must come from the request body.
		session.cartItemId.push(req.body.itemCode);	
		session.cartItemCategory.push(req.body.itemCategory);
		session.cartItemName.push(req.body.itemName);
		session.cartItemDescription.push(req.body.itemDescription);
		session.cartItemPrescribed.push(req.body.itemPrescribed);
		session.cartItemQuantity.push(req.body.itemQuantity);
		session.cartItemUnitPrice.push(req.body.itemUnitPrice);
		session.cartItemImage.push(req.body.itemImage);
		session.cartItemSupplierId.push(req.body.itemSupplierId);
		
		//session.itemCount++;

		console.log('**************New cart session arrays created and initialized>');

		//Display items in the cart for debugging.
		var i= 0;
		console.log('**************Displaying cart session arrays>');
		session.cartItemNumber.forEach(element => {
			console.log('Item Index: ' + element);
			console.log('Item ID: ' + session.cartItemId[i]);
			console.log('Item Name: ' + session.cartItemName[i]);
			console.log('Item Quantity: ' + session.cartItemQuantity[i]);
			i++;
		});	
		
	}

	//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 
	var x= 0;	//Incrementer.
	var array= [];	//Array of cart item objects.
	var objects= [];
	var totalPrice= 0;
	var prescribed= 'false';

	//Need this when initiating the cart.
	if((typeof session.totalPrice== 'undefined') || (session.totalPrice== 'null')){
		totalPrice= 0;
	}else{
		totalPrice= session.totalPrice;
	}

	//Loop through all elements in the cart session array.
	session.cartItemNumber.forEach(element => {

		//Code for debugging.
		//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
		//console.log('Loop Item ID: ' + session.cartItemId[x]);
		//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

		//Create the object.
		var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
		cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
		cartItemImage: '', cartItemSupplierId: ''}

		//Assign session values to the object.
		data.cartItemNumber= session.cartItemNumber[x];
		data.cartItemId = session.cartItemId[x];
		data.cartItemCategory= session.cartItemCategory[x];
		data.cartItemName= session.cartItemName[x];
		data.cartItemDescription = session.cartItemDescription[x];
		data.cartItemPrescribed= session.cartItemPrescribed[x];
		data.cartItemQuantity= session.cartItemQuantity[x];
		data.cartItemUnitPrice= session.cartItemUnitPrice[x];
		data.cartItemImage = session.cartItemImage[x];
		data.cartItemSupplierId = session.cartItemSupplierId[x];

		//Calculating total price.
		totalPrice= totalPrice + (session.cartItemQuantity[x] * session.cartItemUnitPrice[x]);
		session.totalPrice = totalPrice;
		console.log('Total price after item addition: ' + session.totalPrice);

		//Check for prescribed items. Checking this once is enough. 
		if(session.cartItemPrescribed== 'true'){
			prescribed= 'true';
		}
		
		x++; //Increment to the next set of session elements.

		//Push the object into an object array
		array.push(data); 
	});	

	objects.push(array);
	objects.push({'totalPrice': totalPrice});
	objects.push({'prescribed': prescribed});

	//Send the object array to the caller as JSON.
	//res.json(objects);

	//redirect to page
	supplier.getItem(req.body.itemCode, function(result){
		res.redirect('/view-supplier-products-redirect');	

	});

});


//Test function to remove items from the cart. Currently, only the item at the tail can be deleted.
app.post('/remove-from-cart', function(req, res) {
	console.log('**************Item details received for removal from cart>');
	console.log(req.body);

	//Item number has to be received from the form. This has been passed to the views using JSON.
	var removeIndex= req.body.itemNumber;	 
	console.log("Remove cart - Item Number:", removeIndex)

	if(session.cartItemNumber){

		//Handle if itemCount is 0. Destroy the cart session arrays.
		if(session.itemCount== 0){
			session.itemCount= null;
			session.cartItemNumber= null;
			session.cartItemId= null;
			session.cartItemCategory= null;
			session.cartItemName= null;
			session.cartItemDescription= null;
			session.cartItemPrescribed= null;
			session.cartItemQuantity= null;
			session.cartItemUnitPrice= null;
			session.cartItemImage= null;
			session.cartItemSupplierId= null;

			//res.json({'status': 'Cart empty'});
			//return;

			//redirect to cart empty page
			res.redirect('/cart-empty')
		}

		//Remove item. 
		console.log('**************Removing item from cart session arrays>');
		//var cartItemNumber= session.itemCount; //Will only delete the last item in the cart.

		session.cartItemNumber.splice(removeIndex, removeIndex);
		session.cartItemId.splice(removeIndex, removeIndex);
		session.cartItemCategory.splice(removeIndex, removeIndex);
		session.cartItemName.splice(removeIndex, removeIndex);
		session.cartItemDescription.splice(removeIndex, removeIndex);
		session.cartItemPrescribed.splice(removeIndex, removeIndex);
		session.cartItemQuantity.splice(removeIndex, removeIndex);
		session.cartItemUnitPrice.splice(removeIndex, removeIndex);
		session.cartItemImage.splice(removeIndex, removeIndex);
		session.cartItemSupplierId.splice(removeIndex, removeIndex);

		//Rewrite the cartItemNumber array with consolidated index values after removing an item.
		var k= 0;
		console.log('**************Rewriting cartItemNumber index values after removal>');
		session.cartItemNumber.forEach(element => {
			session.cartItemNumber[k]= k;	//Try element= k as well;
			k++;
		});

		//Decrement the item count.
		session.itemCount= session.itemCount- 1;

		//Display items.
		var i= 0;
		console.log('**************Displaying cart session arrays after removal>');
		session.cartItemNumber.forEach(element => {
			console.log('Item Number: ' + element);
			console.log('Item ID: ' + session.cartItemId[i]);
			console.log('Item Name: ' + session.cartItemName[i]);
			console.log('Item Quantity: ' + session.cartItemQuantity[i]);
			i++;
		});	


		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var array= [];	//Array of cart item objects.
		var objects= [];
		var totalPrice= 0;
		var prescribed= 'false';

		//Need this when initiating the cart.
		if(typeof session.totalPrice== 'undefined' || session.totalPrice== 'null'){
			totalPrice= 0;
		}else{
			totalPrice= session.totalPrice;
		}

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Code for debugging.
			//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
			//console.log('Loop Item ID: ' + session.cartItemId[x]);
			//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
			cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
			cartItemImage: '', cartItemSupplierId: ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemCategory= session.cartItemCategory[x];
			data.cartItemName= session.cartItemName[x];
			data.cartItemDescription = session.cartItemDescription[x];
			data.cartItemPrescribed= session.cartItemPrescribed[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			data.cartItemUnitPrice= session.cartItemUnitPrice[x];
			data.cartItemImage = session.cartItemImage[x];
			data.cartItemSupplierId = session.cartItemSupplierId[x];

			//Calculating total price.
			totalPrice= totalPrice + (session.cartItemQuantity[x] * session.cartItemUnitPrice[x]);
			session.totalPrice = totalPrice;
			console.log('Total price after item deletion: ' + session.totalPrice);

			//Check for prescribed items. Checking this once is enough. 
			if(session.cartItemPrescribed== 'true'){
				prescribed= 'true';
			}

			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			array.push(data); 
		});	

		objects.push(array);
		objects.push({'totalPrice': totalPrice});
		objects.push({'prescribed': prescribed});

		//Send the object array to the caller as JSON.
		//res.json(objects);

		//Redirect to cart page
		res.redirect('/cart')

	}else{
		console.log('**************No cart sessions!');
		//res.json({'status': 'Cart empty'});
		res.redirect('/cart-empty')
	}
});

//Test function to temporarily store the prescription till checkout is complete.
app.post('/upload-prescription-process', uploadPrescriptionImageTemporary.single('prescriptionImage'), function(req, res){
	console.log('**************Saving the prescription temporarily till checkout>');
	console.log(req.file);

	//Check if the cart sessions exist.
	//Code.

	//Check if an image file is actually uploaded or not.
	if(typeof req.file== 'undefined' || req.file== null || req.file.filename== ''){
		res.json({'status': 'failure'}); //Return if prescription is null.
		return;

	}else{
		//Check if a prescription was uploaded previously.
		if(session.prescriptionImage){

			//Delete the existing image from the filesystem first.
			try {
				file.unlinkSync(prescriptionImagePathTemporary + req.session.prescriptionImage);
			} catch (error) {
				console.log(error.message);
			}

			//Rename the new image.
			try {
				file.renameSync(prescriptionImagePathTemporary + req.file.filename, prescriptionImagePathTemporary + req.file.filename 
					+ '.jpg');
			} catch (error) {
				console.log(error.message);
			}

			//Update the session variable.
			session.prescriptionImage=  req.file.filename + '.jpg';

			//Redirect as necessary.
			res.json({'prescription': newPrescriptionImagePathTemporary + session.prescriptionImage });

		}else{
			//Rename the new image.
			try {
				file.renameSync(prescriptionImagePathTemporary + req.file.filename, prescriptionImagePathTemporary + req.file.filename 
					+ '.jpg');
			} catch (error) {
				console.log(error.message);
			}

			//Create a session to store the prescription image if it doesn't exist.
			session.prescriptionImage=  req.file.filename + '.jpg'; 

			//Redirect as necessary.
			res.json({'prescription': newPrescriptionImagePathTemporary + session.prescriptionImage });

		}
	}
});

//Work in progress////////////////
app.get('/checkout', function (req, res){
	customer.getProfileData(session.userid, function (result){
		console.log("Checkout - Billing Info: ", result);

		var billingInfo = []

		if(result!= 'failure'){
			res.render('Checkout.ejs', {billingInfo: billingInfo, totalPrice: session.totalPrice, message: "Unable to retrieve billing information!"})
		} else {
			//Update session variables.
			billingInfo.push(session.useremail = result.email);
			billingInfo.push(session.userfirstName = result.firstName);
			billingInfo.push(session.userlastName = result.lastName);
			billingInfo.push(session.userstreet = result.street);
			billingInfo.push(session.usercity = result.city);
			console.log(billingInfo)
			res.render('Checkout.ejs', {billingInfo: billingInfo, totalPrice: session.totalPrice, message: "Unable to retrieve billing information!"})
		}
	});			
});
///////////////////

//Test function for checking out the cart.
//Create an order.
//Create order items from the cart session array.
//Send the required variables in the form.
app.get('/checkout-process', function(req, res) {
	console.log('**************Creating order from the cart>');
	console.log(req.body);
	console.log(session.cartItemNumber)
	//Check if session array exists.
	if(session.cartItemNumber){

		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var array= [];	//Array of cart item objects.
		var totalPrice= 0;
		var prescribed= 'false';

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Code for debugging.
			//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
			//console.log('Loop Item ID: ' + session.cartItemId[x]);
			//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
			cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
			cartItemImage: '', cartItemSupplierId: ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemCategory= session.cartItemCategory[x];
			data.cartItemName= session.cartItemName[x];
			data.cartItemDescription = session.cartItemDescription[x];
			data.cartItemPrescribed= session.cartItemPrescribed[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			data.cartItemUnitPrice= session.cartItemUnitPrice[x];
			data.cartItemImage = session.cartItemImage[x];
			data.cartItemSupplierId = session.cartItemSupplierId[x];

			//Calculating total price.
			totalPrice= totalPrice + (session.cartItemQuantity * session.cartItemUnitPrice);

			//Check for prescribed items. Checking this once is enough. 
			if(session.cartItemPrescribed== 'true'){
				prescribed= 'true';
			}

			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			array.push(data); 
		});	

		//Choose the function depending on whether prescribed items are present or not.
		//If prescribed items are in the cart.
		if(req.body.prescribed== 'true'){

			//Check if a temporary prescription image file is actually uploaded or not.
			if(!req.session.prescriptionImage){
				res.json({'status': 'failure'}); //Return if prescription image session doesn't exist.
				return;
			}

			//Move the image from the temporary path to the permanent path. Yes, the rename function has to be used.
			try {
				file.renameSync(prescriptionImagePathTemporary + req.session.prescriptionImage, 
					prescriptionImagePath + req.session.prescriptionImage);
			} catch (error) {
				console.log(error.message);
			}

			customer.createOrderPrescribed(array, totalPrice, req.supplierId, req.session.userId, 
				newPrescriptionImagePath + req.session.prescriptionImage, function(result){

				//Delete the temporary image from the filesystem after saving the permanent prescription.
				try {
					file.unlinkSync(prescriptionImagePathTemporary + req.session.prescriptionImage);
				} catch (error) {
					console.log(error.message);
				}

				//Delete the session for the temporary prescription.
				req.session.prescriptionImage= null;
				
				res.json(result);
			});

		//If prescribed items are not in the cart.
		}else if(req.body.prescribed== 'false'){
			customer.createOrder(array, totalPrice, req.supplierId, req.session.userId, function(result){

				//Delete the temporary image from the filesystem after saving the permanent prescription.
				try {
					file.unlinkSync(prescriptionImagePathTemporary + req.session.prescriptionImage);
				} catch (error) {
					console.log(error.message);
				}

				//Delete the session for the temporary prescription.
				req.session.prescriptionImage= null;

				res.json(result);
			});
		}
		
	}else{
		res.json({'status': 'Cart empty'});
	}
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Supplier functions (back end)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//This function processes the form to update supplier profile data.
app.post('/edit-supplier-process', uploadStoreImage.single('storeImage'), function(req, res) {
	console.log('**************Received edit supplier profile form data>');
	console.log(req.file);
	console.log(req.body);

	var storeImageFileName;

	//Check if an image file is actually uploaded or not.
	if(typeof req.file== 'undefined' || req.file== null || req.file.filename== ''){
		storeImageFileName= req.session.storeImage;	//Do not change the existing file if a file is not uploaded.

	}else{
		//Handle other file types and limit the maximum file size.
		try {
			file.renameSync(storeImagePath + req.file.filename, storeImagePath + req.file.filename + '.jpg');
		} catch (error) {
			console.log(error.message);
		}

		//Delete the existing image from the filesystem first.
		try {
			file.unlinkSync('./views/' + req.session.storeImage);
		} catch (error) {
			console.log(error.message);
		}
		
		//Format the image file path name to be saved in the database.
		storeImageFileName= newStoreImagePath + req.file.filename + '.jpg';
	}

	//If the conditions are not met to trigger a password change.
	if(req.body.password == '' && req.body.confirmPassword.length == '' ){
			supplier.editProfile(req.body, req.session.userId, req.session.password, storeImageFileName, function(result){
				console.log(result)
				if(result == "success"){
					res.redirect('/supplier-update-validate-success')
				}
				else {
					updtStatus = "fail";
					res.redirect('/supplier-update-validate-fail')
				}
		});

	//If the conditions are met to trigger a password change.		
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
			supplier.editProfile(req.body, req.session.userId, req.body.password, storeImageFileName, function(result){
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


//An API which sends a supplier's product data to the caller.
//The request must include the supplier ID which will be passed into the back end function.
//Request must also include the type of product (prescribed or not).
//Request can optionally have a filter string for the item category.
app.post('/view-supplier-products', function (req, res){
	console.log("**************Showing the selected supplier's data and items>");
	console.log(req.body);
	
	//Get supplier data first.
	//////////Supplier ID is hardcoded for testing.
	//supplier.getSupplierData(req.body.supplierId, function (resultSupplier)
	session.supplieridpharm = ''
	session.supplieridpharm = req.body.user_id

	supplier.getSupplierData(session.supplieridpharm, function (resultSupplier){
		console.log("**************Showing the selected supplier's profile data>");
		console.log(resultSupplier);

		//Then get the respective supplier's items list.
		//supplier.getItemsList(req.body.supplierId, req.body.prescribed, request.body.itemCategory, function (resultItems)
		supplier.getItemsList(session.supplieridpharm, 'false', 'null', function (resultItems){
			console.log("**************Showing the selected supplier's items>");
			console.log(resultItems);

			//Get Category Counts
			var miscCount = 0
			var mediCount = 0
			var grocCount = 0
			var allCount = resultItems.length
			let catCount = new Object();

			for(var i=0; i < resultItems.length; i++)
			{
				if(resultItems[i].category == "Medicine")
				{
					mediCount += 1;
				} else if (resultItems[i].category == "Grocery")
				{
					grocCount += 1;
				} else 
				{
					miscCount += 1;
				}
			}

			catCount.medicine = mediCount;
			catCount.groceries = grocCount;
			catCount.misc = miscCount;
			catCount.all = allCount;
			console.log(catCount)

			//Check if user is logged in
			if(session.userfirstname != null)
			{
				//user is logged in
				console.log(session.userfirstname)
				res.render('Pharmacy.ejs', { userFName: session.userfirstname,  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, message: '', totalPrice: 0});	
			}
			else
			{
				//user is not logged in
				res.render('Pharmacy.ejs', { userFName: '',  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, message: '', totalPrice: 0});
			}
			
		});
	});
	
});

//This function delivers the add item form (Old UI).
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

	supplier.addItem(req.body, newItemImagePath + req.file.filename + '.jpg', req.session.userId, function(result){
		res.sendFile(htmlPath + result + '.html');
	});
});

//An API to view an item. The caller must send 
app.post('/view-item-process', function (req, res){
	console.log("**************Showing the selected item details>");
	console.log(req.body.itemCode);

	supplier.getItem(req.body.itemCode, function(result){
		
		//res.json(result);	//Change this as res.render().

		if(typeof session.userfirstname != null)
			{
				res.render('ProductDetails.ejs', { userFName: session.userfirstname,  ItemDetails: result, totalPrice: 0 });	
			}
			else
			{
				console.log(result);
				res.render('ProductDetails.ejs', { userFName: '',  ItemDetails: result, totalPrice: session.totalPrice });
			}
	});
});


app.get('/test', function(req, res){
	customer.testPromises();
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

//This function delivers a page with a data table (Old UI).
/*app.get('/view-suppliers', function(req, res) {
	res.sendFile(htmlPath + "view-suppliers.html");
});*/


//An API which sends supplier data to the caller.
/*app.get('/view-suppliers-process', function (req, res){
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
});*/

//This function delivers a sample data presentation page (Old UI).
/*app.get('/view-users', function(req, res) {
	res.sendFile(htmlPath + "view-users.html");
});*/

//An API which sends user data to the caller.
/*app.get('/view-users-process', function (req, res){
	//Below is a callback function since node.js doesn't support returning values from functions.
	//Add session authentication as well.
	customer.showUsers(function (result){
		console.log(result);
		res.json(result);	
	});
});*/

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

/*
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

app.post('/checkout-process', uploadPrescriptionImage.single('prescriptionImage'), function(req, res) {
	console.log('**************Creating order from the cart>');
	console.log(req.body);
	console.log(req.file);

	//Check if session array exists.
	if(session.cartItemNumber){

		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var array= [];	//Array of cart item objects.
		var totalPrice= 0;
		var prescribed= 'false';

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Code for debugging.
			//console.log('Loop Item Number: ' + session.cartItemNumber[x]);
			//console.log('Loop Item ID: ' + session.cartItemId[x]);
			//console.log('Loop Item Number: ' + session.cartItemQuantity[x]);

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
			cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
			cartItemImage: '', cartItemSupplierId: ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemCategory= session.cartItemCategory[x];
			data.cartItemName= session.cartItemName[x];
			data.cartItemDescription = session.cartItemDescription[x];
			data.cartItemPrescribed= session.cartItemPrescribed[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			data.cartItemUnitPrice= session.cartItemUnitPrice[x];
			data.cartItemImage = session.cartItemImage[x];
			data.cartItemSupplierId = session.cartItemSupplierId[x];

			//Calculating total price.
			totalPrice= totalPrice + (session.cartItemQuantity * session.cartItemUnitPrice);

			//Check for prescribed items. Checking this once is enough. 
			if(session.cartItemPrescribed== 'true'){
				prescribed= 'true';
			}

			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			array.push(data); 
		});	

		//Choose the function depending on whether prescribed items are present or not.
		//If prescribed items are in the cart.
		if(prescribed== 'true'){
			var prescriptionFileName= 'null';

			//Check if an image file is actually uploaded or not.
			if(typeof req.file== 'undefined' || req.file== null || req.file.filename== ''){
				res.json({'status': 'failure'}); //Return if prescription is null.
				return;

			}else{
				//Handle other file types and limit the maximum file size.
				try {
					file.renameSync(prescriptionImagePath + req.file.filename, prescriptionImagePath + req.file.filename + '.jpg');
				} catch (error) {
					console.log(error.message);
				}
				
				//Format the image file path name to be saved in the database.
				prescriptionFileName= newPrescriptionImagePath + req.file.filename + '.jpg';
			}

			customer.createOrderPrescribed(array, totalPrice, req.supplierId, req.session.userId, prescriptionFileName, function(result){
				res.json(result);
			});

		//If prescribed items are not in the cart.
		}else if(prescribed== 'false'){
			customer.createOrder(array, totalPrice, req.supplierId, req.session.userId, function(result){
				res.json(result);
			});
		}
		
	}else{
		res.json({'status': 'Cart empty'});
	}

});

*/