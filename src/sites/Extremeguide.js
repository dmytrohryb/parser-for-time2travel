const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://extremeguide.pro'
const SHEDULE = '/kalendar-turov/'

async function getDataExtremeguide(cur) {
    const tempData = []
    const response = await axios.get(URL + SHEDULE)
    const $ = cheerio.load(response.data)
    $('table tbody tr').each((i, elem) => {

        tempData.push({
            date: $(elem).find('td:nth-child(3)').text(),
            title: getTitle($(elem).find('td:nth-child(5)').text()),
            duration: getDuration($(elem).find('td:nth-child(5)').text()),
            link: URL + $(elem).find('td:nth-child(5) strong a').attr('href'),
            location: $(elem).find('td:nth-child(1)').text(),
            price: getPriceOnlyNum($(elem).find('td:nth-child(6)').text().replace(/\s/g, ''), cur),
            site: URL
        })

    })
    return tempData
}

function getTitle(str){

    let countSymbols = 0

    for(let i = str.length; i !== 0; i--){
        if(str[i] !== ','){
            countSymbols += 1
        }else{
            break
        }
    }

    let res = str.substr(0, str.length - countSymbols)

    return res
}

function getDuration(str){
    let countSymbols = 0

    for(let i = str.length; i !== 0; i--){
        if(str[i] !== ','){
            countSymbols += 1
        }else{
            break
        }
    }
    let res = getDurationOnlyNum(str.substr(str.length - countSymbols + 1, countSymbols).replace(/\s/g, ''))



    return res
}

let getDurationOnlyNum = (duration) => {
    let _duration = ''
    for (let i = 0; i < duration.length; i++){
        if(Number.isInteger(parseInt(duration[i]))){
            _duration += duration[i]
        }else{
            break
        }
    }

    return _duration
}

let getPriceOnlyNum = (price, cur) => {
    let currency = ''
    let _price = ''

    if(price.match(/USD/g)) {
        currency = 'USD'
    }else if(price.match(/EUR/g)){
        currency = 'EUR'
    }else if(price.match(/RUB/g)){
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

module.exports = getDataExtremeguide
