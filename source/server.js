const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = 80;

//Path preparation.
const path = require('path');
const htmlPath = path.join(__dirname, '/html/');

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res){
  	res.sendFile(htmlPath + "index.html");
});

app.get('/sign-in', function (req, res){
	res.sendFile(htmlPath + "sign-in.html");
});

app.post("/sign-in-process", function(req, res){
	console.log((req.body));
	res.send("Response received!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
