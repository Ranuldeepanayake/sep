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

const bcrypt = require('bcrypt');	//For hashing passwords.
const saltRounds = 2;	//Number of salt rounds for hashing.

const customer = require('./js/customer.js');
const supplier = require('./js/supplier.js');

var session = require('express-session');
const cookieParser = require("cookie-parser");
const { Session } = require('express-session');
const { serialize } = require('v8');
const { error } = require('console');
const { resolve } = require('path');
const { render } = require('ejs');

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

	customer.getOrders(req.session.userId, function(result){
		console.log(result)
		if(result == 'failure'){
			res.render('Account-Customer.ejs', { userFName: req.session.firstName,
			userLName: req.session.lastName,
			userAddress: req.session.street,
			userCity: req.session.city,
			userEmail: req.session.email,
			userPassword: req.session.password,
			valmessage: '',orderDetails: ''});
		} else {
			res.render('Account-Customer.ejs', { userFName: req.session.firstName,
			userLName: req.session.lastName,
			userAddress: req.session.street,
			userCity: req.session.city,
			userEmail: req.session.email,
			userPassword: req.session.password,
			valmessage: '',orderDetails: result});
		}
	});
	
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
			valmessage : "success", orderDetails: ''});
	});
});

app.get('/customer-update-validate-fail', function (req, res, next){
	res.render('Account-customer.ejs', {userFName: req.session.firstName,
		userLName: req.session.lastName,
		userAddress: req.session.street,
		userCity: req.session.city,
		userEmail: req.session.email,
		userPassword :req.session.password,
		valmessage : "fail", orderDetails: ''});
});

//SUPPLIER EDIT PROFILE routes.
app.get('/my-account-supplier', function (req, res, next){
	console.log("In my-account-supplier")
	console.log(req.session.firstName)

	//check if session.userid has a value
	if(session.userid)
	{
	//Get item list of supplier
	supplier.getItemsList(session.userid, function (resultItems){
		console.log("Item List: ", resultItems)

		//Get order list of supplier
		supplier.getOrders(session.userid, function(result){
		if(result == "failure")
		{
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
				valmessage: 'Error in loading Order details!',
				orderList: result, 
				itemList: resultItems});
		}
		else
		{
			console.log("Order List:",result);
			
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
				valmessage: '', 
				orderList: result,
				itemList: resultItems });
		}
		});
	});
	}
	
});

app.get('/acc-sup', function (req, res, next){
	res.render('test.ejs')
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

	console.log("session.supplieridpharm:", session.supplieridpharm)

	//Get supplier data first.
	//////////Supplier ID is hardcoded for testing.
	//supplier.getSupplierData(req.body.supplierId, function (resultSupplier)
	supplier.getSupplierData(session.supplieridpharm, function (resultSupplier){
		console.log("**************Showing the selected supplier's profile data>");
		console.log(resultSupplier);
		
		//Then get the respective supplier's items list.
		//supplier.getItemsList(req.body.supplierId, req.body.prescribed, request.body.itemCategory, function (resultItems)
		supplier.getItemsList(session.supplieridpharm, function (resultItems){
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

			
			if(session.cartItemNumber){
				//Calculate total price
				var totalPrice = 0
				session.totalPrice = 0
				var x = 0
				//Loop through all elements in the cart session array.
				session.cartItemNumber.forEach(element => {
	
		
					//Calculating sub total price.
					var subtotal = 0;
					subtotal= session.cartItemQuantity[x] * session.cartItemUnitPrice[x];
					
					//Calculating total price.
					totalPrice += subtotal;
					session.totalPrice = totalPrice

					x++
				});	
			}

			//Check the cart is empty to display alert
			if(session.itemCount == null){
				res.render('Pharmacy.ejs', { userFName: session.userfirstname,  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, totalPrice: session.totalPrice, message: ''});	
			}
			else{
				console.log(session.totalPrice)
				res.render('Pharmacy.ejs', { userFName: session.userfirstname,  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, totalPrice: session.totalPrice, message: "Item added to cart!"});	
			}
						
		});
	});
	
});

//Redirected to this route after continue shopping is clicked
app.get('/continue-shopping', function (req, res){
	console.log("**************Continue shopping>");
	console.log(req.body);

	console.log("session.supplieridpharm:", session.supplieridpharm)

	//Get supplier data first.
	//////////Supplier ID is hardcoded for testing.
	//supplier.getSupplierData(req.body.supplierId, function (resultSupplier)
	supplier.getSupplierData(session.supplieridpharm, function (resultSupplier){
		console.log("**************Showing the selected supplier's profile data>");
		console.log(resultSupplier);
		
		//Then get the respective supplier's items list.
		//supplier.getItemsList(req.body.supplierId, req.body.prescribed, request.body.itemCategory, function (resultItems)
		supplier.getItemsList(session.supplieridpharm, function (resultItems){
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

			
			if(session.cartItemNumber){
				//Calculate total price
				var totalPrice = 0
				session.totalPrice = 0
				var x = 0
				//Loop through all elements in the cart session array.
				session.cartItemNumber.forEach(element => {
	
		
					//Calculating sub total price.
					var subtotal = 0;
					subtotal= session.cartItemQuantity[x] * session.cartItemUnitPrice[x];
					
					//Calculating total price.
					totalPrice += subtotal;
					session.totalPrice = totalPrice

					x++
				});	
			}

			//Check the cart is empty to display alert
			if(session.itemCount == null){
				res.render('Pharmacy.ejs', { userFName: session.userfirstname,  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, totalPrice: session.totalPrice, message: ''});	
			}
			else{
				console.log(session.totalPrice)
				res.render('Pharmacy.ejs', { userFName: session.userfirstname,  ItemDetails: resultItems, SupplierDetails: resultSupplier, CategoryCount: catCount, totalPrice: session.totalPrice, message: "none"});	
			}
						
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

	
	//CUSTOMER
	if(req.body.userType== 'customer'){
		//Save data in the database.
		customer.signUp(req.body, function(result){
			//console.log(result)

				if(result == "success"){
					res.redirect("/registration-success");
				}
				else {
					res.redirect('/registration-error');
				}
			});	
	}
	//SUPPLIER
	else if(req.body.userType== 'supplier'){
		//Checking additional supplier fields
		if(req.body.nmraRegistration== '' || req.body.pharmacistRegistration== '' || req.body.storeDescription== ''){
			res.redirect('/register-supplier-validate');

		} else {
		//Save data in the database.
		supplier.signUp(req.body, function(result){
			//console.log(result)
				if(result == "success"){
					console.log('pre');
					res.redirect('/registration-success');
					console.log('post');
				}
				else{
					res.redirect('/registration-error');
				}
			});	
		}
	}
});

app.post("/sign-in-process", function(req, res){
	console.log('**************Received sign in form data>');
	console.log(req.body);

	customer.signIn(req.body, function (result){
		console.log(result);

		if(result.loggedIn== 'true'){
			
			if(result.userType== 'customer'){
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
				session.userType = result.userType;
				session.email = result.email;
				session.lastName = result.lastName;
				session.street = result.street;
				session.city = result.city;
				session.password = result.password;

				res.locals.userFname = result.firstName;
				//res.sendFile(htmlPath + 'success.html');
				//res.redirect('/');
				console.log("**************Logged in!");
				res.redirect('/index');

			}else if(result.userType== 'supplier'){
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

				//recreating as they are not accessible 
				session.userfirstname = result.firstName;
				session.userid = result.userId;
				session.loggedstatus = "true";
				session.userType = result.userType;
				session.email = result.email;
				session.lastName = result.lastName;
				session.street = result.street;
				session.city = result.city;
				session.password = result.password;
	
				//res.sendFile(htmlPath + 'success.html');
				console.log("**************Logged in!");
				res.redirect('/my-account-supplier');
			}

		}else{
			req.session.loggedIn = "false";
			console.log("**************Invalid credentials!");
			res.redirect('/login-validate');
		}
	});
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
			customer.editProfile(req.body, req.session.userId, req.session.password, 'false',function(result){
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
			customer.editProfile(req.body, req.session.userId, req.body.password, 'true', function(result){
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
});

/* Merged 
//This function shows the order history of the logged in customer.
app.get('/view-customer-orders-process', function(req, res){
	console.log("**************Showing orders of the logged in customer>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		customer.getOrders(req.session.userId, function(result){
			res.json(result);
		});
	}
});*/

//This function shows the selected order of customer.
app.post('/view-customer-order-process', function(req, res){
	console.log("**************Showing details of a selected order>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Order ID has to be sent as the first argument.
		customer.getOrder(req.body.order_id, function(result){
			if(result == 'failure'){
				res.render('OrderDetails-Customer.ejs',{userFName: session.userfirstname, orderDetails: '', orderDetailItems: '', 
				approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: '' })		
			}
			else{
				res.render('OrderDetails-Customer.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
				approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: '' })		
			}
		});
	}
});

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
function clearCart()
{
	session.cartItemNumber = ''
	session.totalPrice = 0
}

app.get('/cart', function (req, res){
	if(session.cartItemNumber){

		//The below code creates an object array using the cart session variables and passes the object as JSON to the API caller. 

		var x= 0;	//Incrementer.
		var cartItems= []; //Array of cart item objects.
		var totalPrice= 0;

		//Loop through all elements in the cart session array.
		session.cartItemNumber.forEach(element => {

			//Create the object.
			var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
			cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
			cartItemImage: '', cartItemSupplierId: '', cartItemSubTotal: '', dbQuantity: '', remainingQuantity: ''}

			//Assign session values to the object.
			data.cartItemNumber= session.cartItemNumber[x];
			data.cartItemId = session.cartItemId[x];
			data.cartItemCategory= session.cartItemCategory[x];
			data.cartItemName= session.cartItemName[x];
			data.cartItemDescription = session.cartItemDescription[x];
			data.cartItemPrescribed= session.cartItemPrescribed[x];
			data.cartItemQuantity= session.cartItemQuantity[x];
			data.dbQuantity= session.dbQuantity[x]; //Quantity from Db
			data.remainingQuantity= session.remainingQuantity[x]; //Quantity left
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

			//Does not work as the value will get replaced each iteration
			/*
			//Check for prescribed items. Checking this once is enough. 
			if(session.cartItemPrescribed == 'true'){
				prescribed= 'true';
			}*/

			x++; //Increment to the next set of session elements.

			//Push the object into an object array
			cartItems.push(data); 
		});	

		//Check if there are prescribed items in the cartItems object array
		let filtered = cartItems.filter(row => row.cartItemPrescribed === 'true');
		session.prescribed = filtered
			
			//check if its the first time loading the page
			
			if (filtered.length > 0) {
				if (typeof session.prescriptionImage === 'undefined'){
					res.render('Cart.ejs', {userFName: session.userfirstname, cartItems: cartItems, totalPrice: totalPrice, reqPrescription: 1, isCartEmpty: 0, prescriptionUploaded: 'null', prescriptionFile: ''})
				} else if (session.prescriptionImage.length > 1){
					res.render('Cart.ejs', {userFName: session.userfirstname, cartItems: cartItems, totalPrice: totalPrice, reqPrescription: 1, isCartEmpty: 0, prescriptionUploaded: 1, prescriptionFile: session.prescriptionOriginalName})
				} else {
					res.render('Cart.ejs', {userFName: session.userfirstname, cartItems: cartItems, totalPrice: totalPrice, reqPrescription: 1, isCartEmpty: 0, prescriptionUploaded: 0, prescriptionFile: ''})
				}
			}
			else
			{
				res.render('Cart.ejs', {userFName: session.userfirstname, cartItems: cartItems, totalPrice: totalPrice, reqPrescription: 0, isCartEmpty: 0, prescriptionUploaded: 'null', prescriptionFile: ''})

			}
				 ///////////////////////////
				 
	}else{
		//res.json({'status': 'Cart empty'});
		res.redirect('/cart-empty')
	}
	
});

//Cart Empty Redirect
app.get('/cart-empty', function (req, res){
	//Reset totalPrice session variable	
	session.totalPrice = 0
	
	res.render('Cart.ejs', {userFName: session.userfirstname, cartItems: {}, totalPrice: session.totalPrice, reqPrescription: 0, isCartEmpty: 1, prescriptionFile: ''})
});

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
		session.cartItemQuantity.push(req.body.itemQuantity); //Quantity added
		session.dbQuantity.push(req.body.itemDbQuantity); //Quantity from Db
		session.remainingQuantity.push(req.body.itemDbQuantity - req.body.itemQuantity); //Quantity left
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
		session.dbQuantity=[]; //Quantity from Db
		session.remainingQuantity=[]; //Quantity left
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
		session.dbQuantity.push(req.body.itemDbQuantity); //Quantity from Db
		session.remainingQuantity.push(req.body.itemDbQuantity - req.body.itemQuantity); //Quantity left
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
			console.log('Item Quantity in DB: ' + session.dbQuantity[i]);
			console.log('Item Quantity remaining: ' + session.remainingQuantity[i]);
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
		cartItemImage: '', cartItemSupplierId: '', dbItemQuantity: '', remainingItemQuantity: ''}

		//Assign session values to the object.
		data.cartItemNumber= session.cartItemNumber[x];
		data.cartItemId = session.cartItemId[x];
		data.cartItemCategory= session.cartItemCategory[x];
		data.cartItemName= session.cartItemName[x];
		data.cartItemDescription = session.cartItemDescription[x];
		data.cartItemPrescribed= session.cartItemPrescribed[x];
		data.cartItemQuantity= session.cartItemQuantity[x];
		data.dbQuantity= session.dbQuantity[x];
		data.remainingQuantity= session.remainingQuantity[x];
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
			session.dbQuantity= null;
			session.remainingQuantity= null;
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

		//Check if item number is 0
		if(req.body.itemNumber == 0){
			session.cartItemNumber.splice(removeIndex, 	1);
			session.cartItemId.splice(removeIndex, 1);
			session.cartItemCategory.splice(removeIndex, 1);
			session.cartItemName.splice(removeIndex, 1);
			session.cartItemDescription.splice(removeIndex, 1);
			session.cartItemPrescribed.splice(removeIndex, 1);
			session.cartItemQuantity.splice(removeIndex, 1);
			session.dbQuantity.splice(removeIndex, 1);
			session.remainingQuantity.splice(removeIndex, 1);
			session.cartItemUnitPrice.splice(removeIndex, 1);
			session.cartItemImage.splice(removeIndex, 1);
			session.cartItemSupplierId.splice(removeIndex, 1);
		} else {
			session.cartItemNumber.splice(removeIndex, removeIndex);
			session.cartItemId.splice(removeIndex, removeIndex);
			session.cartItemCategory.splice(removeIndex, removeIndex);
			session.cartItemName.splice(removeIndex, removeIndex);
			session.cartItemDescription.splice(removeIndex, removeIndex);
			session.cartItemPrescribed.splice(removeIndex, removeIndex);
			session.cartItemQuantity.splice(removeIndex, removeIndex);
			session.dbQuantity.splice(removeIndex, 1);
			session.remainingQuantity.splice(removeIndex, 1);
			session.cartItemUnitPrice.splice(removeIndex, removeIndex);
			session.cartItemImage.splice(removeIndex, removeIndex);
			session.cartItemSupplierId.splice(removeIndex, removeIndex);
		}

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
			data.dbQuantity= session.dbQuantity[x];
			data.remainingQuantity= session.remainingQuantity[x];
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
	//console.log('Filename: ' + req.file.filename);
	//Check if the cart sessions exist.
	//Code.

	//assign original file name
	session.prescriptionOriginalName = req.file.originalname

	//Check if an image file is actually uploaded or not.
	if(typeof req.file== 'undefined' || req.file== null || req.file.filename== ''){
		//res.json({'status': 'failure'}); //Return if prescription is null.
		//return;

		//redirect to page
		//session.prescriptionUploaded = 0
		console.log("1")
		res.redirect('/cart')

	}else{
		//Check if a prescription was uploaded previously.
		if(session.prescriptionImage){

			//Delete the existing image from the filesystem first.
			try {
				file.unlinkSync(prescriptionImagePathTemporary + session.prescriptionImage);
			} catch (error) {
				console.log(error.message);
			}

			//Rename the new image.
			try {
				file.renameSync(prescriptionImagePathTemporary + req.file.filename, prescriptionImagePathTemporary + req.file.filename + '.jpg');
					
			} catch (error) {
				console.log(error.message);
			}

			//Update the session variable.
			session.prescriptionImage=  req.file.filename + '.jpg';

			//Redirect as necessary.
			//res.json({'prescription': newPrescriptionImagePathTemporary + session.prescriptionImage });
			
			//session.prescriptionUploaded = 1
			res.redirect('/cart')

		}else{
			//Rename the new image.
			try {
				//console.log("rename", prescriptionImagePathTemporary + req.file.filename, prescriptionImagePathTemporary + req.file.filename + '.jpg')
				file.renameSync(prescriptionImagePathTemporary + req.file.filename, prescriptionImagePathTemporary + req.file.filename + '.jpg');
			} catch (error) {
				console.log(error.message);
				
			}

			//Create a session to store the prescription image if it doesn't exist.
			session.prescriptionImage=  req.file.filename + '.jpg'; 

			//Redirect as necessary.
			//res.json({'prescription': newPrescriptionImagePathTemporary + session.prescriptionImage });
			
			//.prescriptionUploaded = 1
			res.redirect('/cart')

		}
	}
});

//Work in progress////////////////
app.get('/checkout', function (req, res){
	console.log('**************Proceed to checkout>');
	customer.getProfileData(session.userid, function (result){
		var x = 0
		var billingInfo = []
		var cartItems = []

		if(result == 'failure'){
			res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: cartItems, totalPrice: session.totalPrice, message: "Unable to retrieve billing information!"})
		} else {
			//Get billing info
			var userData = {email: result.email
						,firstName: result.firstName
						,lastName: result.lastName
						,street: result.street
						,city: result.city}
			
			billingInfo.push(userData);

			//Get item list
			session.cartItemNumber.forEach(element => {
				//Create the object.
				var data = {cartItemName: '' 
							,cartItemSubTotal: ''}
	
				//Assign session values to the object.
				data.cartItemName= session.cartItemName[x];

				//Calculating sub total price.
				var subtotal = 0;
				subtotal= session.cartItemQuantity[x] * session.cartItemUnitPrice[x];
				data.cartItemSubTotal = subtotal;
	
				x++; //Increment to the next set of session elements.
	
				//Push the object into an object array*/
				cartItems.push(data); 
			});	

			//console.log(billingInfo)	
			res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: cartItems, totalPrice: session.totalPrice, message: ''})		
		}
	});	
	
});
///////////////////

app.get('/place-order', function (req, res){
	console.log('**************Place-order>');
	customer.getProfileData(session.userid, function (result){
		var x = 0
		var billingInfo = []
		var array = []
		var totalPrice = 0

		//Get billing info
		var userData = {email: result.email
			,firstName: result.firstName
			,lastName: result.lastName
			,street: result.street
			,city: result.city}

		billingInfo.push(userData);

		if(result == 'failure'){
			res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: array, totalPrice: session.totalPrice, message: "Unable to retrieve billing information!"})
		} else {
			//Get item list
			session.cartItemNumber.forEach(element => {

				//Create the object.
				var data= {cartItemNumber : '', cartItemId : '', cartItemCategory: '', cartItemName: '', 
				cartItemDescription: '', cartItemPrescribed: '', cartItemQuantity : '', cartItemUnitPrice: '', 
				cartItemImage: '', cartItemSupplierId: '', cartItemSubtotal: ''}

				//Assign session values to the object.
				data.cartItemNumber= session.cartItemNumber[x];
				data.itemId = session.cartItemId[x];
				data.cartItemCategory= session.cartItemCategory[x];
				data.cartItemName= session.cartItemName[x];
				data.cartItemDescription = session.cartItemDescription[x];
				data.cartItemPrescribed= session.cartItemPrescribed[x];
				data.itemQuantity= session.cartItemQuantity[x];
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

				x++; //Increment to the next set of session elements.

				//Push the object into an object array
				array.push(data); 
			});	

			//console.log(billingInfo)
			console.log('**************Deciding the order type>');
			
			//Choose the function depending on whether prescribed items are present or not.
			//If prescribed items are in the cart.
			if(session.prescribed.length > 0){
				//Check if a temporary prescription image file is actually uploaded or not.
				if(!session.prescriptionImage){
					res.json({'status': 'failure'}); //Return if prescription image session doesn't exist.
					return;
				}

				//Move the image from the temporary path to the permanent path. Yes, the rename function has to be used.
				try {
					file.renameSync(prescriptionImagePathTemporary + session.prescriptionImage, 
						prescriptionImagePath + session.prescriptionImage);
				} catch (error) {
					console.log(error.message);
				}

				customer.createOrderPrescribed(array, totalPrice, session.supplieridpharm, session.userid, 
					newPrescriptionImagePath + session.prescriptionImage, function(result){
						console.log('**************Placing a prescribed order>');
					
					// check if order was created successfully
					console.log(result)
					if(result == 'success')
					{
						//res.render('Success.ejs')
						clearCart()
						res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: array, totalPrice: session.totalPrice, message: result})	
					}
					else
					{
						res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: array, totalPrice: session.totalPrice, message: 'Something went wrong! Please try again!'})	
					}
				});

			//If prescribed items are not in the cart.
			}else if(session.prescribed.length == 0){
				customer.createOrder(array, totalPrice, session.supplieridpharm, session.userid, function(result){
					console.log('**************Placing a non-prescribed order>');
					//res.json(result);

					// check if order was created successfully
					if(result == "success")
					{
						//res.render('Success.ejs')
						res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: array, totalPrice: session.totalPrice, message: result})	

					}
					else
					{
						//res.json(result);
						res.render('Checkout.ejs', {userFName: session.userfirstname, billingInfo: billingInfo, cartItems: array, totalPrice: session.totalPrice, message: result})	
					}
				});
			}
	
			
		}
	});			
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
			supplier.editProfile(req.body, req.session.userId, req.session.password, storeImageFileName, 'false', function(result){
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
			supplier.editProfile(req.body, req.session.userId, req.body.password, storeImageFileName, 'true', function(result){
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
		supplier.getItemsList(session.supplieridpharm, function (resultItems){
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

//An API to view an item. The caller must send 
app.post('/view-item-process', function (req, res){
	console.log("**************Showing the selected item details>");
	console.log(req.body.itemCode);

	//Variables for replacing DB quantity with cart quantity
	var sessionData= [];
	var x= 0;
	supplier.getItem(req.body.itemCode, function(result){
		if(typeof session.userfirstname != null)
			{
			//Replace dbQuantity with remainingQuantity
			if(session.cartItemNumber){
				session.cartItemNumber.forEach(element => {
	
					//Create the object.
					var data= { item_code : '', quantity: ''}
		
					//Assign session values to the object.
					data.item_code = session.cartItemId[x];
					data.quantity= session.remainingQuantity[x]; //Quantity left
	
					sessionData.push(data)
					x++
				});
	
				//var commonItems = []
				
				for (var i = 0; i < sessionData.length; i++) {
					for (var k = 0; k < result.length; k++) {
						console.log(sessionData[i].item_code , result[k].item_code)
						if (sessionData[i].item_code == result[k].item_code) {
						result[k].quantity = sessionData[i].quantity
						//commonItems.push(result[k].item_code)
						break;
						}
					}
				}
				}
				/////////////////////

				if(session.totalPrice != null){
					res.render('ProductDetails.ejs', { userFName: session.userfirstname,  ItemDetails: result, totalPrice: session.totalPrice });	
				} else {
					res.render('ProductDetails.ejs', { userFName: session.userfirstname,  ItemDetails: result, totalPrice: 0 });	
				}
				
			}
			else
			{
				console.log(result);
				res.render('ProductDetails.ejs', { userFName: '',  ItemDetails: result, totalPrice: 0 });
			}

		});
});

/* Merged
//This function shows the orders placed for a certain supplier.
app.get('/view-supplier-orders-process', function(req, res){
	console.log("**************Showing orders of the logged in supplier>");

	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//supplier.getOrders(req.session.userId, function(result){
			supplier.getOrders(session.userid, function(result){
			res.json(result);
		});
	}
});
*/


//This function shows the selected order of customer.
app.post('/view-supplier-order-process', function(req, res){
	console.log("**************Showing details of a selected order>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Order ID has to be sent as the first argument.
		supplier.getOrder(req.body.order_id, function(result){
			if(result == 'failure'){
				res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
				approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: '' })		
			}
			else{
				console.log(result);
				res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
				approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: '' })	
			}	
		});
	}
});

//This function approves/rejects a selected order.
app.post('/supplier-approve-reject-order-process', function(req, res){
	console.log("**************Approving a selected order>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Order ID has to be sent as the first argument.
		console.log("req.body: ", req.body)
		//check if approve btn was clicked
		if(req.body.action == 'approve'){
			supplier.approveOrder(req.body.order_id, function(result){
				if(result == 'failure'){
					supplier.getOrder(req.body.order_id, function(result){
						res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
									approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Error in approving order! Please try again!' })			
					});
				}else{
					supplier.getOrder(req.body.order_id, function(result){
						res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
									approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Order approved!' })			
					});
				}
			});
		//check if reject btn was clicked
		} else if(req.body.action == 'reject'){
			if(req.body.reject_reason == ''){
				supplier.getOrder(req.body.order_id, function(result){
					res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
								approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Reject Empty' })			
				});
			} else {
				supplier.rejectOrder(req.body.order_id, req.body.reject_reason, function(result){
					if(result == 'failure'){
						supplier.getOrder(req.body.order_id, function(result){
							res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
										approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Error in rejecting order! Please try again!' })			
						});
					}else{
						supplier.getOrder(req.body.order_id, function(result){
							res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
										approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Order rejected!' })			
						});
					}
				});
			}
		}
	}
});

//view prescription
app.post('/view-prescription', function(req, res){
	console.log("req.body.prescription_image", req.body.prescription_image)
	res.render('View-Prescription.ejs', {prescription: req.body.prescription_image})
});


//get form to add item
app.get('/add-item-form', function(req, res) {
	res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: ''})
});

//This function processes adding an item.
app.post('/add-item-process', uploadItemImage.single('imagePath'), function(req, res) {
	console.log("Form received!");
	// req.file is the name of your file in the form above, here 'uploaded_file'
	// req.body will hold the text fields, if there were any 
	console.log(req.file, req.body);
	console.log(req.body.itemName);

	//Handle other file types and limit the maximum file size.
	file.renameSync(itemImagePath + req.file.filename, itemImagePath + req.file.filename + '.jpg');

	supplier.addItem(req.body, newItemImagePath + req.file.filename + '.jpg', session.userid, function(result){
		if(result == 'failure'){
			res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: result, message: 'fail'})
		} else{
			res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: result, message: 'Item Added Successfully!'})
		}
	});
});

//Get item details to be edited
app.post('/get-item-details', function(req, res){
	console.log("**************Details of selected item>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Item ID has to be sent as the first argument.
		console.log("req.body.item_code:", req.body.item_code)
		supplier.getItem(req.body.item_code, function(result){
			console.log(result)
			res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: result, message: ''})
		});
	}
});

//This function updates/removes a selected item.
app.post('/edit-item-process', uploadItemImage.single('prescriptionImageFile'), function(req, res){
	console.log("**************Edit a selected item>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		console.log("req.body:", req.body)
		if(req.body.action == 'delete')
		{
			supplier.removeItem(req.body.itemCode, function(result){
				if(result == 'failure'){
					res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: 'fail'})
				}else{
					res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: 'Item deleted successfully!'})
				}				
			});
		} else if(req.body.action == 'update'){
			console.log("**************Updating the selected item>");
			console.log(req.body);
			console.log(req.file);

			var itemImageFileName;

			//Check if an image file is actually uploaded or not.
			if(typeof req.file != 'undefined'){
				//Save the new image.
				//Handle other file types and limit the maximum file size.
				file.renameSync(itemImagePath + req.file.filename, itemImagePath + req.file.filename + '.jpg');
				itemImageFileName= newItemImagePath + req.file.filename + '.jpg';

				//Delete the old image.
				//Delete the existing image from the filesystem first.
				try {
					file.unlinkSync('./views/' + req.body.oldItemImage);
				} catch (error) {
					console.log(error.message);
				}
			
				//If the image has to be saved.
				supplier.updateItem(req.body, itemImageFileName, 'true', function(result){
					if(result == 'failure'){
						res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: 'fail'})
					}else{
						res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: 'Item deleted successfully!'})
					}	
				});
			} else if(typeof req.file == 'undefined' ){

				var itemImageFileName = req.body.prescriptionImage

				supplier.updateItem(req.body, itemImageFileName, 'true', function(result){
					if(result == 'failure'){
						res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: 'fail'})
					}else{
						res.render('Edit-inventory.ejs', {userFName: req.session.firstName, itemDetails: '', message: 'Item updated successfully!'})
					}	
				});
			}
		}
	}
});

app.get('/about-us', function(req, res){
	console.log("**************About us>");
	
	res.render('about.ejs');
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

/* Merge the 2 actions to one route
//This function approves a selected order.
app.post('/supplier-approve-order-process', function(req, res){
	console.log("**************Approving a selected order>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Order ID has to be sent as the first argument.
		console.log("req.body.order_id: ", req.body.order_id)
		supplier.approveOrder(req.body.order_id, function(result){
			if(result == 'failure'){
				supplier.getOrder(req.body.order_id, function(result){
					res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
								approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Error in approving order! Please try again!' })			
				});
			}else{
				supplier.getOrder(req.body.order_id, function(result){
					res.render('OrderDetails.ejs',{userFName: session.userfirstname, orderDetails: result[0], orderDetailItems: result[1], 
								approvalStatus: req.body.approval_status, prescriptionReq: req.body.prescription_needed, message: 'Order approved!' })			
				});
			}
		});
	}
});

//This function rejects a selected order.
app.get('/supplier-reject-order-process', function(req, res){
	console.log("**************Rejecting a selected order>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Order ID and the rejection reason has to be sent as arguments.
		supplier.rejectOrder(105, 'Bad prescription', function(result){
			res.json(result);
		});
	}
});*/


// remove/update merged to a single function
//This function removes a selected item.
/*
app.get('/remove-item-process', function(req, res){
	console.log("**************Deleting a selected item>");
	
	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')

	}else{
		//Item ID has to be sent as the first argument.
		supplier.removeItem(4, function(result){
			res.json(result);
		});
	}
});*/

//This function updates an item.
//Data has to be sent from the form.
//The old item image path has to be sent in an input named 'oldItemImage'.
//Handle image uploads.
/*

app.post('/update-item-process', uploadItemImage.single('itemImage'), function(req, res){
	console.log("**************Updating the selected item>");
	console.log(req.body);
	console.log(req.file);

	//Check session status.
	if(typeof req.session.userId== 'undefined'){
		console.log("**************User not logged in!");
		res.redirect('/my-account-error')
		return;
	}

	var itemImageFileName;

	//Check if an image file is actually uploaded or not.
	if(typeof req.file== 'undefined' || req.file== null || req.file.filename== ''){

		//Do not change the existing file if a file is not uploaded.
		supplier.updateItem(req.body, itemImageFileName, 'false', function(result){
			res.json(result);
			return;	//Exit the function from here.
		});	

	}else{
		//Save the new image.
		//Handle other file types and limit the maximum file size.
		file.renameSync(itemImagePath + req.file.filename, itemImagePath + req.file.filename + '.jpg');
		itemImageFileName= newItemImagePath + req.file.filename + '.jpg';

		//Delete the old image.
		//Delete the existing image from the filesystem first.
		try {
			file.unlinkSync('./views/' + req.body.oldItemImage);
		} catch (error) {
			console.log(error.message);
		}
	}	
	
	//If the image has to be saved.
	supplier.updateItem(req.body, itemImageFileName, 'true', function(result){
		res.json(result);
	});
});
*/


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

*/

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
/*
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
			if(!session.prescriptionImage){
				res.json({'status': 'failure'}); //Return if prescription image session doesn't exist.
				return;
			}

			//Move the image from the temporary path to the permanent path. Yes, the rename function has to be used.
			try {
				file.renameSync(prescriptionImagePathTemporary + session.prescriptionImage, 
					prescriptionImagePath + session.prescriptionImage);
			} catch (error) {
				console.log(error.message);
			}

			customer.createOrderPrescribed(array, totalPrice, req.supplierId, req.session.userId, 
				newPrescriptionImagePath + session.prescriptionImage, function(result){

				//Delete the temporary image from the filesystem after saving the permanent prescription.
				try {
					file.unlinkSync(prescriptionImagePathTemporary + session.prescriptionImage);
				} catch (error) {
					console.log(error.message);
				}

				//Delete the session for the temporary prescription.
				session.prescriptionImage= null;
				
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

//This function processes the login form.
/* app.post("/sign-in-process", function(req, res){
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
*/


