const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://proydisvit.com'
const SHEDULE = '/shedule'

async function getDataProydisvit() {
    let cur = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
    let curDate = ''
    let tempData = []
    const response = await axios.get(URL + SHEDULE)
    const $ = cheerio.load(response.data)
    $('table tr').each((i, elem) => {
        if($(elem).find('td.dateRow').text() !== ''){
            curDate = parseDate($(elem).find('td.dateRow').text())
        }
        if($(elem).find('td.tr-date').text() !== ''){
            tempData.push({
                date: parseDay($(elem).find('td.tr-date').text().replace(/\s/g, '').substr(4,$(elem).find('td.tr-date').text().replace(/\s/g, '').length - 4)) + '.' + curDate,
                title: $(elem).find('td.tr-name a').text(),
                link: URL + $(elem).find('td.tr-name a').attr('href'),
                //duration: getDuration($(elem).find('td:nth-child(3) span.t_list_tl').text()),
                location: $(elem).find('td.tr-location').text().replace(/\s/g, '').substr(8, $(elem).find('td.tr-location').text().replace(/\s/g, '').length),
                price: getPriceOnlyNum($(elem).find('td.tr-price').text().replace(/\s/g, ''), cur.data),
                site: URL
            })
        }

    })
    console.log(tempData)
    return tempData
}

getDataProydisvit()

function parseString(str){
    for (let i = 0; i < str.length; i++){

    }
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

function parseDate(str){

    let monthName = ''
    let year = ''
    let month = ''

    for(let i = 0; i < str.length; i++){
        if(!Number.isInteger(parseInt(str[i]))){
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

    if(monthName.match(/Січень/g)) month = '01'
    if(monthName.match(/Лютий/g)) month = '02'
    if(monthName.match(/Березень/g)) month = '03'
    if(monthName.match(/Квітень/g)) month = '04'
    if(monthName.match(/Травень/g)) month = '05'
    if(monthName.match(/Червень/g)) month = '06'
    if(monthName.match(/Липень/g)) month = '07'
    if(monthName.match(/Серпень/g)) month = '08'
    if(monthName.match(/Вересень/g)) month = '09'
    if(monthName.match(/Жовтень/g)) month = '10'
    if(monthName.match(/Листопад/g)) month = '11'
    if(monthName.match(/Грудень/g)) month = '12'

    return month + '.' + year
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
