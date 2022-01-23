const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const file = require('fs');
const port = 3000;

//Path preparation.
const path= require('path');
const htmlPath= path.join(__dirname, '/html/');
const filePath= path.join(__dirname, '/html/'); 

const db = require('./js/db.js');

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

app.post("/sign-in-process", function(req, res){
	//console.log((req.body));
	//Below is a callback function since node.js doesn't support.
	db.showUsers(function (result){
		console.log(result);

		//Write to the json file.
		file.writeFile(filePath + "data.json", JSON.stringify(result), (err) => {
			if (err) throw err;
			console.log('Data written to file');

			res.sendFile(htmlPath + "view-users.html");
		});
	});
	//res.send("Response received!");
});

app.post("/sign-up-process", function(req, res){
	//console.log((req.body));
	var temp;
	db.signUp(req.body, function(result){
		temp= result;
	});

	res.send(temp.toString);
});

app.all('*', function(req, res) {
    	res.send("Bad response");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
