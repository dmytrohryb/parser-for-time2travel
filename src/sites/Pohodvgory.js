const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://pohod-v-gory.com'
const SHEDULE = '/tours/%d1%80%d0%b0%d1%81%d0%bf%d0%b8%d1%81%d0%b0%d0%bd%d0%b8%d0%b5-%d0%bf%d0%be%d1%85%d0%be%d0%b4%d0%be%d0%b2/'

let getDataPohodvgory = async function(cur){
    const tempData = []
    const response = await axios.get(URL + SHEDULE)
    const $ = cheerio.load(response.data)
    $('div.date-pohods-wrapper div.date_pohods div.schd-box').each((i, elem) => {
        tempData.push({
            date: $(elem).find('div.schd-tbl div.start-date').text().substr(1, 10),
            site: 'https://pohod-v-gory.com',
            title: $(elem).find('div.schd-name a').text().replace(/\r?\n/g, ""),
            link: URL + $(elem).find('div.schd-name a').attr('href'),
            price: getPriceOnlyNum($(elem).find('div.schd-price').text().replace(/\s/g, ''), cur),
            location: $(elem).find('div.schd-place').text().replace(/\s/g, ''),
            duration: getDurationOnlyNum($(elem).find('div.schd-loc').text().replace(/\s/g, ''))
        })
    })
    return tempData
}

let getPriceOnlyNum = (price, cur) => {
    let currency = ''
    let _price = ''

    if(price.match(/\$/g)) {
        currency = 'USD'
    }else if(price.match(/€/g)){
        currency = 'EUR'
    }else if(price.match(/руб/g)){
        currency = 'RUR'
    }

    for (let i = 0; i < price.length; i++){
        if(Number.isInteger(parseInt(price[i]))){
            _price += price[i]
        }else{
            break
        }
    }

    switch (currency) {
        case "USD":
            return Math.round(_price * cur[0].sale)
        case "EUR":
            return Math.round(_price * cur[1].sale)
        case "RUR":
            return Math.round(_price * cur[2].sale)
    }

    return parseInt(_price)
}

let getDurationOnlyNum = (duration) => {
    let _duration = ''
    for (let i = 0; i < duration.length; i++){
        if(Number.isInteger(parseInt(duration[i]))){
            _duration += duration[i]
        }else{
            return _duration
        }
    }
}

module.exports = getDataPohodvgory
