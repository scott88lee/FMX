  function readPrice() {
    let integer = document.getElementsByClassName('ig-ticket-price-button_pre-emphasised-price')
    let decimal = document.getElementsByClassName('ig-ticket-price-button_emphasised-price')
    let pips = document.getElementsByClassName('ig-ticket-price-button_post-emphasised-price')
    
    sellPrice = integer[0].innerText + decimal[0].innerText + pips[0].innerText
    buyPrice = integer[1].innerText + decimal[1].innerText + pips[1].innerText
    
    priceTimeSeries.push(sellPrice)
  }  
  
  var priceTimeSeries = []
  
  function selectDirection(action) {
    let selection = document.getElementsByClassName('ig-ticket-price-button_price-direction')

    if (action == "sell") {
      selection[0].click()
    } 
    else if (action == "buy"){
      selection[1].click()
    }
  }

  let polling = setInterval(readPrice, 5000)
