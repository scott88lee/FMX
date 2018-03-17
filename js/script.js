//Declaring Variables
var commPrice = 100;
var speed = 400; 			// Game speed in miliseconds
var interval = 0; 			// Interval before direction change
var direction = true; 		// Price up or Down

var range = [100,100]; // Index 0 - High, 1 - Low

// Player GLOBALS - index 0 - Player, 1 - Bot1, 2 - Bot2
var player = [
	{
		capital : 1000,
		holdings : 0,
		holdingCost  : [],
		totalCost : 0,
		runningPNL : 0,
		trendCounter : 0,
		comparator : [0,100],
		sellCounter : 0,
		memory : [0,0],
		agro : 2
	},
	{
		capital : 1000,
		holdings : 0,
		holdingCost  : [],
		totalCost : 0,
		runningPNL : 0,
		trendCounter : 0,
		comparator : [0,100],
		sellCounter : 0,
		memory : [5,8],
		agro : 2
	},
	{
		capital : 1000,
		holdings : 0,
		holdingCost  : [],
		totalCost : 0,
		runningPNL : 0,
		trendCounter : 0,
		comparator : [0,100],
		sellCounter : 0,
		memory : [4,2],
		agro : 2
	},
	{
		capital : 1000,
		holdings : 0,
		holdingCost  : [],
		totalCost : 0,
		runningPNL : 0,
		trendCounter : 0,
		comparator : [0,100],
		sellCounter : 0,
		memory : [0,0],
		agro : 2
	}
];

//Shorten DOM calls
var displayPrice = document.getElementById('price');

var displayCapital = [	document.getElementById('capital'),
						document.getElementById('capital1'),
						document.getElementById('capital2'),
						document.getElementById('capital3')];

var displayCost = [	document.getElementById('cost'),
					document.getElementById('cost1'),
					document.getElementById('cost2'),
					document.getElementById('cost3')];

var displayHoldings = [	document.getElementById('holdings'),
						document.getElementById('holdings1'),
						document.getElementById('holdings2'),
						document.getElementById('holdings3')];

var displayRPNL = [	document.getElementById('rPNL'),
					document.getElementById('rPNL1'),
					document.getElementById('rPNL2'),
					document.getElementById('rPNL3')];

var displayHigh = document.getElementById('maxPrice');
var displayLows = document.getElementById('minPrice');
var display10ma = document.getElementById('ma10');
var display50ma = document.getElementById('ma50');

var btnBuy = document.getElementById('btnBuy');
var btnSell = document.getElementById('btnSell');

/////////////////////////////////////////////////////////////
btnBuy.addEventListener('click', function(){buy(0)});	  ///
btnSell.addEventListener('click', function(){sell(0)});	  /// Add Listeners
/////////////////////////////////////////////////////////////


//\\//\\//\\//\\//\\//\\ Chart //\\//\\//\\//\\//\\//\\
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

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}
//\\//\\//\\//\\//\\//\\ Chart //\\//\\//\\//\\//\\//\\

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
function calMA(ticks){
	var sumTemp = 0;
	if (chart.data.datasets[0].data.length > ticks) {
		for (var i = chart.data.datasets[0].data.length-ticks; i < chart.data.datasets[0].data.length; i++){
			sumTemp += chart.data.datasets[0].data[i];
		}
	var avg = sumTemp / ticks;
	avg = Math.round(avg * 100)/100;
	}
	if (avg > 0){
	return avg; 
	} else { return 100;} // Moving Averages Calculation
}
function recordRange() {
	if (commPrice > range[0]) {			// Calculate range
		range[0] = commPrice;
	}
	if (commPrice < range[1]) {
		range[1] = commPrice;
	}
}
function updateDisplay(){
	displayPrice.innerText = commPrice;

	for (var i=0; i<player.length; i++){
		displayCapital[i].innerText = player[i].capital;
		displayHoldings[i].innerText = player[i].holdings;
		displayCost[i].innerText = player[i].totalCost;
		displayRPNL[i].innerText = player[i].runningPNL;
	}
}

function buy(id) {
	player[id].holdings++;  // Add to holdings
	player[id].capital -= commPrice;  // Deduct from capital

	player[id].holdingCost.push(commPrice);
	
	var tempBuySum = 0;
	for (var i=0; i<player[id].holdingCost.length; i++){
		tempBuySum += player[id].holdingCost[i];
	}
	player[id].totalCost = tempBuySum;

	player[id].totalCost = Math.round(player[id].totalCost * 100)/100; //rounding
	player[id].capital = Math.round(player[id].capital * 100)/100; //rounding

	console.log(id + " BUY!!");
	updateDisplay();
}
function sell(id){
	if (player[id].holdings > 0) {
		player[id].holdings--;
		player[id].capital += commPrice;
		player[id].holdingCost.shift();

		var tempSum = 0;
		for (var i=0; i<player[id].holdingCost.length; i++){
		tempSum += player[id].holdingCost[i];
		}

		player[id].totalCost = tempSum;

		player[id].totalCost = Math.round(player[id].totalCost * 100)/100; //rounding
		player[id].capital = Math.round(player[id].capital * 100)/100;
	//SELL!
		if (player[id].holdings ===0)       //Final sale resets display to zero
			{displayCost[id].innerText = 0;}
	} else {
		alert("You can't do naked shorts, buy the asset first.");
	}
}


//==============================================================\\		___
function bot(arg,id){					//		   BOT CODE  	//	   (0 0)  
	//set currentPrice to comparator							//   __| - |__    
	player[id].comparator.push(commPrice); // [0,100,99]		//  //| o=o |\\  
																// <] | o=o | [>	  
	if (player[id].comparator[1] > player[id].comparator[2]) {	//	  \=====/
		player[id].trendCounter++;								//     *****  						//    
	}

	if (player[id].trendCounter >= player[id].memory[1] && player[id].comparator[2]>player[id].comparator[1]) {
		for (var i = 0; i < arg; i++){
			buy(id);
		}
		player[id].sellCounter += player[id].memory[0];
		player[id].trendCounter = 0;
	}

	if (player[id].comparator[2] > player[id].comparator[1]) {
		player[id].trendCounter = 0; 
	}

	player[id].comparator.shift();

	if (player[id].sellCounter > 1) {
		player[id].sellCounter--;
	} else if ( player[id].sellCounter === 1) {
		for (var i = 0; i < arg; i++){
			sell(id);
			calAgro(id);
		}
		player[id].sellCounter = 0;
	}
}
function calAgro(id){
	if (player[id].capital > 1000) {							//
		player[id].agro = Math.round(player[id].capital/200);	//	
	}															//	
}																//
//==============================================================\\

//////////////////////////////////////////////////////////
function game() {

	updateDisplay();

	displayHigh.innerText = range[0];
	displayLows.innerText = range[1];
	display10ma.innerText = calMA(10);
	display50ma.innerText = calMA(50);
	//runningPNL(); //display rPNL
	//botRunningPNL();//display Bot RPNL

	// Calculate indicators
	recordRange();

	bot(player[1].agro,1);
	bot(player[2].agro,2);


///////////////////////////////////////////////////////////
///////////////// CHART MECHANICS /////////////////////////
	addData(chart, " ", commPrice)
	interval--;
	if (interval <= 0){					//Chart direction
		interval = randomDuration();
		direction = !direction;
	}
	if (commPrice <= 50){       		// Price will never go to ZERO
		direction = true;
	}
	if ( direction === true){			// Changes the commPrice
		commPrice += priceJump();
		commPrice = Math.round(commPrice * 100)/100;
	} else {
		commPrice -= priceJump();
		commPrice = Math.round(commPrice * 100)/100;		
	}
	if (chart.data.datasets[0].data.length > 88){   // Total num of entries on chart
    	chart.data.datasets[0].data.shift();
    	chart.data.labels.shift();
    }
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
	if (player[0].capital <= 0){
		alert("You're broke! GAME OVER!");			//STOPS THE GAME WHEN NO MONEY
		clearInterval(FMX);
	}
}

var FMX = setInterval(game,speed); //Init Loop
