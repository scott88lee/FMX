//Declaring Variables
var commPrice = 100;
var difficulty = 1; // 1-Easy 2-Medium 3-Hard
var speed = 500; // Milliseconds
var capital = 100000;
var interval = 0;
var direction = true;

//Shorten DOM calls
var displayCapital = document.getElementById('capital');
var displayPrice = document.getElementById('price');
var displayInterval = document.getElementById('interval');
var displayDirection = document.getElementById('direction');
var btnBuy = document.getElementById('btnBuy');
var btnSell = document.getElementById('btnSell');

//Add Listeners
btnBuy.addEventListener('click',function(){buy()});
btnSell.addEventListener('click',function(){sell()});


function randomDuration(){
	var duration = Math.floor(Math.random() * Math.floor(15));
	return duration;	 //Generates random interval
}
function priceJump() { //Generates the price move amount
	min = Math.ceil(1);
	max = Math.floor(11);
	var value = Math.floor(Math.random() * (max - min)) + min;
	//The maximum is exclusive and the minimum is inclusive
	value = value / 10;
	console.log(value);
	return value;
}
function buy(){
	console.log("BUY!!!!!!!!!!");
	capital -= commPrice;
	capital = Math.round(capital * 1000)/1000;
	//BUY!
}
function sell(){
	console.log("SELLL!!!!!!!!");
	capital += commPrice;
	capital = Math.round(capital * 1000)/1000;
	//SELL!
}


function updateDisplay() {
	displayDirection.innerText = direction;
	displayInterval.innerText = interval;
	displayPrice.innerText = commPrice;
	displayCapital.innerText = capital;
	capital--;
	interval--;
	if (interval <= 0){
		interval = randomDuration();
		direction = !direction;
	}
	if (commPrice <= 50){  // Price will never go to ZERO
		direction = true;
	}

	if ( direction === true){
		commPrice += priceJump();
		commPrice = Math.round(commPrice * 1000)/1000;
	} else {
		commPrice -= priceJump();
		commPrice = Math.round(commPrice * 1000)/1000;		
	}
	if (capital === 0){			//STOPS THE GAME WHEN NO MONEY
		clearInterval(myVar);
	}
}

var myVar = setInterval(updateDisplay,speed);
