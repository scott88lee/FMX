// API Docs at:
// http://www.tvmaze.com/api
// what to do when we recieve the request
var responseHandler = function() {
  console.log("response text", this.responseText);
  var response = JSON.parse( this.responseText );
  console.log("status code", this.status);
};
////////////////////////////////////////////////
// make a new request
var request = new XMLHttpRequest();

// listen for the request response
request.addEventListener("load", responseHandler);

var searchValue = document.getElementById('show-search')

// ready the system by calling open, and specifying the url
//request.open("GET", "http://api.tvmaze.com/search/shows?q=");

// send the request
//request.send();
//////////////////////////////////////////////////

var requestFailed = function(){
  console.log("response text", this.responseText);
  console.log("status text", this.statusText);
  console.log("status code", this.status);
};

request.addEventListener("error", requestFailed);

var doSubmit = function(event){
  event.preventDefault();
  var input = searchValue.value;
  var url = "http://api.tvmaze.com/search/shows?q=" + input;
  request.open("GET", url);
  request.send();
};

document.querySelector('#search').addEventListener('submit', doSubmit);