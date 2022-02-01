//File is currently not in use.
//Script to get session data which can be included in all the HTML views.
//URL of the API.
const api_url = 'http://localhost:3000/get-session';

//Create an XMLHttpRequest Object.
var request = new XMLHttpRequest;

//Call the open function, GET-type of request, url, true-asynchronous
request.open('GET', api_url, true);

//Execute when the request is sent.
request.onload = function() {

//check if the HTTP response is 200 (ok).
    if (this.status === 200) {
        //return server response as an object with JSON.parse
        var data= JSON.parse(this.responseText);
        console.log(data);

        if(data.loggedIn == null){
        console.log('Session not created. Please log in.');
        document.getElementById('logoutButton').style.display = 'none';
        }else if(data.loggedIn == 'true'){
        console.log(data.email);
        document.getElementById("firstNameField").innerHTML =  'Hi ' + data.firstName;
        }else{
        console.log('Unknown error!');
        }
    }
}

//Make the API call.
request.send();