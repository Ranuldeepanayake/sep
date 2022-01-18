const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = 80;

//Path preparation.
const path = require('path');
const htmlPath = path.join(__dirname, '/html/');

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
	console.log((req.body));
	res.send("Response received!");
});

app.post("/sign-up-process", function(req, res){
	//console.log((req.body));
	res.send("Response received!");
	db.signUp(req.body);
});

app.all('*', function(req, res) {
    	res.send("Bad response");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
