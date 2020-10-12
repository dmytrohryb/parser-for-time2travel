const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://www.marshrut-club.com'
const SHEDULE = '/calendar'

async function getDataMarshrutclub(cur) {
    let curDate = ''
    let tempData = []
    const response = await axios.get(URL + SHEDULE)
    const $ = cheerio.load(response.data)
    $('table tr').each((i, elem) => {
        if($(elem).find('th div').text() !== ''){
            curDate = parseDate($(elem).find('th div').text())
        }
        if($(elem).find('td:nth-child(1)').text() !== ''){
            tempData.push({
                date: parseDay($(elem).find('td:nth-child(1)').text()) + '.' + curDate,
                title: $(elem).find('td:nth-child(3) div b').text(),
                link: URL + $(elem).find('td:nth-child(3) div b a').attr('href'),
                duration: getDuration($(elem).find('td:nth-child(3) span.t_list_tl').text()),
                location: $(elem).find('td:nth-child(2)').text(),
                price: getPriceOnlyNum($(elem).find('td:nth-child(3) div.cal_right_bl span.prbl_new_price').text(), cur),
                site: "Marshrut-club.com"
            })
        }

    })

    return tempData
}

function getDuration(str) {

    let duration = ''
    for(let i = 0; i < str.length; i++){
        if(Number.isInteger(parseInt(str[i]))){
            duration += str[i]
        }
    }
    return duration
}

function parseDate(str){

    let monthName = ''
    let year = ''
    let month = ''

    for(let i = 0; i < str.length; i++){
        if(!Number.isInteger(parseInt(str[i])) && str[i] !== ' '){
            monthName += str[i]
        }else{
            break
        }
    }

    for(let i = 0; i < str.length; i++){
        if(Number.isInteger(parseInt(str[i]))){
            year += str[i]
        }
    }

    switch (monthName) {
        case 'Январь':
            month = '01'
            break
        case 'Февраль':
            month = '02'
            break
        case 'Март':
            month = '03'
            break
        case 'Апрель':
            month = '04'
            break
        case 'Май':
            month = '05'
            break
        case 'Июнь':
            month = '06'
            break
        case 'Июль':
            month = '07'
            break
        case 'Август':
            month = '08'
            break
        case 'Сентябрь':
            month = '09'
            break
        case 'Октябрь':
            month = '10'
            break
        case 'Ноябрь':
            month = '11'
            break
        case 'Декабрь':
            month = '12'
            break
    }

    return month + '.' + year
}

function parseDay(str){
    let day = ''
    for(let i = 0; i < str.length; i++){
        if(Number.isInteger(parseInt(str[i]))){
            day += str[i]
        }else{
            break
        }
    }
    if(day.length > 1){
        return day
    }else{
        return '0' + day
    }

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

module.exports = getDataMarshrutclub
