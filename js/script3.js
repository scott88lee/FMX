// ── Game variables ──────────────────────────────────────────
var commPrice = 100;
var speed     = 400;   // ms per tick
var interval  = 0;     // ticks until direction change
var direction = true;  // true = up, false = down
var range     = [100, 100]; // [high, low]

// ── Players ─────────────────────────────────────────────────
// index 0 = human, 1 = Safe bot, 2 = Greedy bot, 3 = Variable bot
var player = [
	{ capital: 1000, holdings: 0, holdingCost: [], totalCost: 0, runningPNL: 0,
	  trendCounter: 0, comparator: [0,100], sellCounter: 0, memory: [0,0], agro: 2 },
	{ capital: 1000, holdings: 0, holdingCost: [], totalCost: 0, runningPNL: 0,
	  trendCounter: 0, comparator: [0,100], sellCounter: 0, memory: [3,8], agro: 2 },
	{ capital: 1000, holdings: 0, holdingCost: [], totalCost: 0, runningPNL: 0,
	  trendCounter: 0, comparator: [0,100], sellCounter: 0, memory: [4,3], agro: 2 },
	{ capital: 1000, holdings: 0, holdingCost: [], totalCost: 0, runningPNL: 0,
	  trendCounter: 0, comparator: [0,100], sellCounter: 0, memory: [3,5], agro: 2 }
];

// ── DOM refs ─────────────────────────────────────────────────
var displayPrice = document.getElementById('price');

var displayCapital  = [ document.getElementById('capital'),  document.getElementById('capital1'),
						document.getElementById('capital2'),  document.getElementById('capital3') ];
var displayCost     = [ document.getElementById('cost'),     document.getElementById('cost1'),
						document.getElementById('cost2'),     document.getElementById('cost3') ];
var displayHoldings = [ document.getElementById('holdings'), document.getElementById('holdings1'),
						document.getElementById('holdings2'), document.getElementById('holdings3') ];
var displayRPNL     = [ document.getElementById('rPNL'),     document.getElementById('rPNL1'),
						document.getElementById('rPNL2'),     document.getElementById('rPNL3') ];

var displayHigh  = document.getElementById('maxPrice');
var displayLows  = document.getElementById('minPrice');
var display10ma  = document.getElementById('ma10');
var display50ma  = document.getElementById('ma50');
var feedbackEl   = document.getElementById('feedback');

document.getElementById('btnBuy').addEventListener('click',  function(){ buy(0); });
document.getElementById('btnSell').addEventListener('click', function(){ sell(0); });

var feedbackTimer = null;
function showFeedback(msg) {
	feedbackEl.innerText = msg;
	feedbackEl.style.opacity = 1;
	clearTimeout(feedbackTimer);
	feedbackTimer = setTimeout(function(){ feedbackEl.style.opacity = 0; }, 2000);
}

// ── Lightweight Charts setup ─────────────────────────────────
var chartContainer = document.getElementById('chart-window');

var lwChart = LightweightCharts.createChart(chartContainer, {
	width:  chartContainer.clientWidth,
	height: 420,
	layout: {
		backgroundColor: '#131722',
		textColor:        '#c8c8d0',
	},
	grid: {
		vertLines: { color: '#1e222d' },
		horzLines: { color: '#1e222d' },
	},
	rightPriceScale: {
		borderColor: '#2a2e3a',
	},
	timeScale: {
		borderColor:   '#2a2e3a',
		timeVisible:   false,
		tickMarkFormatter: function() { return ''; },
	},
	crosshair: {
		mode: LightweightCharts.CrosshairMode.Normal,
	},
});

var candleSeries = lwChart.addCandlestickSeries({
	upColor:     '#26a69a',
	downColor:   '#ef5350',
	borderVisible: false,
	wickUpColor:   '#26a69a',
	wickDownColor: '#ef5350',
});

var ma10Series = lwChart.addLineSeries({
	color:            'rgba(180, 180, 255, 0.8)',
	lineWidth:        1,
	priceLineVisible: false,
	lastValueVisible: false,
});

var ma50Series = lwChart.addLineSeries({
	color:            'rgba(255, 255, 180, 0.8)',
	lineWidth:        1,
	priceLineVisible: false,
	lastValueVisible: false,
});

window.addEventListener('resize', function() {
	lwChart.applyOptions({ width: chartContainer.clientWidth });
});

// ── Candle management ────────────────────────────────────────
var CANDLE_SIZE   = 5;   // ticks per candle
var tickCount     = 0;
var candleTime    = 1000000;
var currentCandle = null;
var closePrices   = [];

function initCandle(price) {
	candleTime++;
	currentCandle = { time: candleTime, open: price, high: price, low: price, close: price };
}

function updateCandle(price) {
	currentCandle.high  = Math.max(currentCandle.high, price);
	currentCandle.low   = Math.min(currentCandle.low,  price);
	currentCandle.close = price;
	candleSeries.update(currentCandle);
}

function calMA(ticks) {
	if (closePrices.length < ticks) return null;
	var sum = 0;
	for (var i = closePrices.length - ticks; i < closePrices.length; i++) {
		sum += closePrices[i];
	}
	return Math.round(sum / ticks * 100) / 100;
}

function updateMAs() {
	var ma10 = calMA(10);
	var ma50 = calMA(50);
	if (ma10 !== null) {
		ma10Series.update({ time: candleTime, value: ma10 });
		display10ma.innerText = ma10;
	}
	if (ma50 !== null) {
		ma50Series.update({ time: candleTime, value: ma50 });
		display50ma.innerText = ma50;
	}
}

// ── Macro cycle ───────────────────────────────────────────────
var MACRO_STATES    = ['bull', 'bear', 'sideways'];
var macroDriftMap   = { bull: 0.08, bear: -0.08, sideways: 0 };
var macroState      = MACRO_STATES[Math.floor(Math.random() * 3)];
var macroInterval   = 200 + Math.floor(Math.random() * 300); // 200–500 ticks

function advanceMacro() {
	macroInterval--;
	if (macroInterval <= 0) {
		macroState    = MACRO_STATES[Math.floor(Math.random() * 3)];
		macroInterval = 200 + Math.floor(Math.random() * 300);
	}
}

// ── Price mechanics ──────────────────────────────────────────
function randomDuration() {
	return Math.floor(Math.random() * 18);
}

function priceJump() {
	return (Math.floor(Math.random() * 10) + 1) / 10;
}

function recordRange() {
	if (commPrice > range[0]) range[0] = commPrice;
	if (commPrice < range[1]) range[1] = commPrice;
}

// ── Display ──────────────────────────────────────────────────
function updateDisplay() {
	displayPrice.innerText = commPrice;

	var leadValue = -Infinity;
	var leaderId  = 0;

	for (var i = 0; i < player.length; i++) {
		var marketValue = player[i].holdings * commPrice;
		player[i].runningPNL = Math.round((marketValue - player[i].totalCost) * 100) / 100;

		var totalValue = player[i].capital + marketValue;
		if (totalValue > leadValue) { leadValue = totalValue; leaderId = i; }

		displayCapital[i].innerText  = player[i].capital;
		displayHoldings[i].innerText = player[i].holdings;
		displayCost[i].innerText     = player[i].totalCost;
		displayRPNL[i].innerText     = player[i].runningPNL;

		displayCapital[i].className = 'content ' + (player[i].capital >= 1000 ? 'positive' : 'negative');
		displayRPNL[i].className    = 'content ' + (player[i].runningPNL > 0 ? 'positive' : player[i].runningPNL < 0 ? 'negative' : '');
	}

	var panels = document.querySelectorAll('.bot');
	for (var j = 0; j < panels.length; j++) {
		panels[j].classList.toggle('winning', j === leaderId);
	}
}

// ── Buy / Sell ───────────────────────────────────────────────
function buy(id) {
	if (id === 0 && player[id].capital < commPrice) {
		showFeedback("Not enough capital to buy!");
		return;
	}
	player[id].holdings++;
	player[id].capital -= commPrice;
	player[id].holdingCost.push(commPrice);

	var sum = 0;
	for (var i = 0; i < player[id].holdingCost.length; i++) sum += player[id].holdingCost[i];
	player[id].totalCost = Math.round(sum * 100) / 100;
	player[id].capital   = Math.round(player[id].capital * 100) / 100;

	updateDisplay();
}

function sell(id) {
	if (player[id].holdings > 0) {
		player[id].holdings--;
		player[id].capital += commPrice;
		player[id].holdingCost.shift();

		var sum = 0;
		for (var i = 0; i < player[id].holdingCost.length; i++) sum += player[id].holdingCost[i];
		player[id].totalCost = Math.round(sum * 100) / 100;
		player[id].capital   = Math.round(player[id].capital * 100) / 100;

		if (player[id].holdings === 0) displayCost[id].innerText = 0;
	} else {
		if (id === 0) showFeedback("Nothing to sell — buy first.");
	}
}

// ── Bot logic ────────────────────────────────────────────────
function bot(arg, id) {
	player[id].comparator.push(commPrice);

	if (player[id].comparator[1] > player[id].comparator[2]) {
		player[id].trendCounter++;
	}

	if (player[id].trendCounter >= player[id].memory[1] && player[id].comparator[2] > player[id].comparator[1]) {
		for (var i = 0; i < arg; i++) buy(id);
		player[id].sellCounter += player[id].memory[0];
		player[id].trendCounter = 0;
	}

	if (player[id].comparator[2] > player[id].comparator[1]) {
		player[id].trendCounter = 0;
	}

	player[id].comparator.shift();

	if (player[id].sellCounter > 1) {
		player[id].sellCounter--;
	} else if (player[id].sellCounter === 1) {
		for (var i = 0; i < arg; i++) { sell(id); calAgro(id); }
		player[id].sellCounter = 0;
	}
}

function calAgro(id) {
	if (player[id].capital > 1000) {
		player[id].agro = Math.round(player[id].capital / 200);
	}
}

// ── Game loop ────────────────────────────────────────────────
function game() {
	updateDisplay();
	recordRange();
	displayHigh.innerText = range[0];
	displayLows.innerText = range[1];

	bot(player[1].agro, 1);
	bot(player[2].agro, 2);
	bot(player[3].agro, 3);

	// Update candlestick chart
	tickCount++;
	if (!currentCandle) {
		initCandle(commPrice);
	} else {
		updateCandle(commPrice);
	}
	if (tickCount % CANDLE_SIZE === 0) {
		closePrices.push(currentCandle.close);
		updateMAs();
		initCandle(commPrice);
	}

	// Move price
	interval--;
	if (interval <= 0) {
		interval  = randomDuration();
		direction = !direction;
	}
	if (commPrice <= 50) direction = true;

	var move = (direction ? priceJump() : -priceJump()) + macroDriftMap[macroState];
	commPrice = Math.round((commPrice + move) * 100) / 100;

	advanceMacro();

	// Game over
	if (player[0].capital <= 0) {
		showFeedback("GAME OVER — You're broke!");
		clearInterval(FMX);
	}
}

// Pre-populate chart with history before game starts
function preRun(ticks) {
	for (var t = 0; t < ticks; t++) {
		// Move price
		interval--;
		if (interval <= 0) {
			interval  = randomDuration();
			direction = !direction;
		}
		if (commPrice <= 50) direction = true;
		var move = (direction ? priceJump() : -priceJump()) + macroDriftMap[macroState];
		commPrice = Math.round((commPrice + move) * 100) / 100;
		advanceMacro();

		// Build candles
		tickCount++;
		if (!currentCandle) {
			initCandle(commPrice);
		} else {
			updateCandle(commPrice);
		}
		if (tickCount % CANDLE_SIZE === 0) {
			closePrices.push(currentCandle.close);
			updateMAs();
			initCandle(commPrice);
		}
	}

	// Sync range and display to where price landed
	range = [commPrice, commPrice];
	updateDisplay();
	displayHigh.innerText = range[0];
	displayLows.innerText = range[1];
}

preRun(500);
var FMX = setInterval(game, speed);
