//Declaring Variables
var commPrice = 100;
var difficulty = 1; // 1-Easy 2-Medium 3-Hard
var speed = 400; // Milliseconds
var capital = 10000;
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

//Chart
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
//chart

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
	addData(chart, " ", commPrice)
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
	if (chart.data.datasets[0].data.length > 88){
    	chart.data.datasets[0].data.shift();
    	chart.data.labels.shift();
    }

	if (capital === 0){			//STOPS THE GAME WHEN NO MONEY
		clearInterval(myVar);
	}

}

var myVar = setInterval(updateDisplay,speed);
