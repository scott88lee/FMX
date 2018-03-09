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

function randomDuration(){
	var duration = Math.floor(Math.random() * Math.floor(12));
	return duration;	 //Generates random interval
}

function priceJump() { //Generates the price move amount
	var priceMove = Math.floor(Math.random() * Math.floor(10))/10;
	return priceMove;
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
	} else {
		commPrice -= priceJump();
	}

}

setInterval(updateDisplay,speed);
