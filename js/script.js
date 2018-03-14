//Declaring Variables
var commPrice = 100;
var difficulty = 1;		// 1-Easy 2-Medium 3-Hard
var speed = 500; 		// Milliseconds
var capital = 1000;
var botAvail = 1000;
var interval = 0; 		// Interval before direction change
var direction = true; 	// Price up or Down
var holdings = 0;
var botHoldings = 0; 	 	// Initialise
var assetValue = 0;
var botAssetValue = 0;
var profit = 0;
var minPrice = 100;
var maxPrice = 0;
var ma10 = 0;
var ma50 = 0;
var rPNL = 0;
var cost = [];
var botCost = [];
var trendCounter = 0;
var comparator = [0,100];
var sellCounter = 0;


//Shorten DOM calls
var displayCapital = document.getElementById('capital');
var displayBotAvail = document.getElementById('botAvail');
var displayPrice = document.getElementById('price');
var displayAsset = document.getElementById('asset');
var displayBotAsset = document.getElementById('botAsset');
var displayHoldings = document.getElementById('holdings');
var displayBotHoldings = document.getElementById('botHoldings');
var displayHigh = document.getElementById('maxPrice');
var displayLows = document.getElementById('minPrice');
var display10ma = document.getElementById('ma10');
var display50ma = document.getElementById('ma50');
var displayrPNL = document.getElementById('rPNL');
var displayBotRPNL = document.getElementById('botRPNL');
var btnBuy = document.getElementById('btnBuy');
var btnSell = document.getElementById('btnSell');


// Add Listeners
btnBuy.addEventListener('click',buy);
btnSell.addEventListener('click',function(){sell()});

// Chart
var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: [" ", " "],
        datasets: [{
            label: "Price",
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderColor: 'rgb(222,222,222)',
            data: [100,100.1],
        }]
    },

    // Configuration options go here
    options: {
         legend: {
            display: false
         },
         tooltips: {
            enabled: false
         }
    }
});
// Chart

function difficulty(){
	///
}
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}
function randomDuration(){
	var duration = Math.floor(Math.random() * Math.floor(18));
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
	holdings++;
	var tempSum=0;
	capital -= commPrice;
	cost.push(commPrice);
	for (var i = 0; i<cost.length; i++){
		tempSum += cost[i];
	}
	displayAsset.innerText = tempSum;
	capital = Math.round(capital * 100)/100;
	//BUY!
}
function botBuy(){
	console.log("BotBUY!!!!!");
}
function sell(){
	console.log("SELLL!!!!!!!!");
	if (holdings > 0) {
		holdings--;
		capital += commPrice;
		cost.shift();
		capital = Math.round(capital * 100)/100;
	//SELL!
				if (holdings ===0){displayAsset.innerText = 0;}
	} else {
		alert("You can't do naked shorts, buy the asset first.");
	}
}
function botSell(){
	console.log("BotSell!!!!!");
}
function cal10ma(){
	var sum10 = 0;
	if (chart.data.datasets[0].data.length > 10) {
		for (var i = chart.data.datasets[0].data.length-10; i < chart.data.datasets[0].data.length; i++){
			sum10 += chart.data.datasets[0].data[i];
		}
	var avg10 = sum10 / 10;
	ma10 = Math.round(avg10 * 100)/100;
	}
}
function cal50ma(){
	var sum50 = 0;
	if (chart.data.datasets[0].data.length > 50) {
		for (var i = chart.data.datasets[0].data.length-50; i < chart.data.datasets[0].data.length; i++){
			sum50 += chart.data.datasets[0].data[i];
		}
	var avg50 = sum50 / 50;
	ma50 = Math.round(avg50 * 100)/100;
	}
}
function runningPNL(){
	var tempSum = 0;
	if (holdings > 0){
	for (var i = 0; i<cost.length; i++){
		tempSum += cost[i];
	}
	rPNL = (commPrice * holdings) - tempSum;
	}
	if (holdings ===0){
	rPNL = 0;}
	rPNL = Math.round(rPNL * 100)/100;
	displayrPNL.innerText = rPNL;
}
function botThink(){
	//set currentPrice to comparator
	comparator.push(commPrice); // [0,100,99]

	if (comparator[1] > comparator[2]) {
		trendCounter++;
		console.log("trendCounter++")
	}

	if (trendCounter >= 8 && comparator[2]>comparator[1]) {
		console.log("TRIGGER BOT-BUY!!!!!!");
		sellCounter +=4;
		trendCounter = 0;
	}

	if (comparator[2] > comparator[1]) {
		trendCounter = 0; 
	}

	comparator.shift();


	if (sellCounter > 0) {
		sellCounter--;
	} else if ( sellCounter = 1) {
		//console.log("TRIGGER BOT-SELL!!!!!");
		sellCounter = 0;
	}
}


function updateDisplay() {
	displayHoldings.innerText = holdings;
	displayBotHoldings.innerText = botHoldings;
	displayPrice.innerText = commPrice;
	displayCapital.innerText = capital;
	displayBotAvail.innerText = botAvail;
	displayHigh.innerText = maxPrice;
	displayLows.innerText = minPrice;
	display10ma.innerText = ma10;
	display50ma.innerText = ma50;
	runningPNL(); //display rPNL

	//difficulty();
	cal50ma();
	cal10ma();
	botThink();

	addData(chart, " ", commPrice)

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
		commPrice = Math.round(commPrice * 100)/100;
	} else {
		commPrice -= priceJump();
		commPrice = Math.round(commPrice * 100)/100;		
	}
	if (chart.data.datasets[0].data.length > 88){
    	chart.data.datasets[0].data.shift();
    	chart.data.labels.shift();
    }

	if (capital <= 0){
		alert("You're broke! GAME OVER!");			//STOPS THE GAME WHEN NO MONEY
		clearInterval(myVar);
	}

	if (assetValue < 0){
		netAssetValueDisplay = 0;
	} else {
		netAssetValueDisplay = assetValue;
	} // Main Game Loop

	if (commPrice > maxPrice) {
		maxPrice = commPrice;
	}
	if (commPrice < minPrice) {
		minPrice = commPrice;
	}
}
var myVar = setInterval(updateDisplay,speed); //Init Loop
