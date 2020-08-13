const axios = require('axios')
const cheerio = require('cheerio')
const luxon = require('luxon')
var DateTime = luxon.DateTime
const URL = 'https://proydisvit.com'
const SHEDULE = '/shedule'

async function getDataProydisvit(cur) {

    let curDate = ''
    let tempData = []
    const response = await axios.get(URL + SHEDULE)
    const $ = cheerio.load(response.data)
    $('table tr').each((i, elem) => {
        if($(elem).find('td.dateRow').text() !== ''){
            curDate = parseDate($(elem).find('td.dateRow').text())
        }
        if($(elem).find('td.tr-date').text() !== ''){
            let temp = getDuration(parseDay($(elem).find('td.tr-date').text().replace(/\s/g, '').substr(4,$(elem).find('td.tr-date').text().replace(/\s/g, '').length - 4)) + '.' + curDate, $(elem).find('td.tr-date').text().replace(/\s/g, '').substr(4,$(elem).find('td.tr-date').text().replace(/\s/g, '').length - 4).substr(6, $(elem).find('td.tr-date').text().replace(/\s/g, '').substr(4,$(elem).find('td.tr-date').text().replace(/\s/g, '').length - 4).length - 6) + curDate.substr(2, curDate.length - 2))
            tempData.push({
                date: parseDay($(elem).find('td.tr-date').text().replace(/\s/g, '').substr(4,$(elem).find('td.tr-date').text().replace(/\s/g, '').length - 4)) + '.' + curDate,
                title: $(elem).find('td.tr-name a').text(),
                link: URL + $(elem).find('td.tr-name a').attr('href'),
                duration: (temp !== 0) ? temp : 1,
                location: $(elem).find('td.tr-location').text().replace(/\s/g, '').substr(8, $(elem).find('td.tr-location').text().replace(/\s/g, '').length),
                price: getPriceOnlyNum($(elem).find('td.tr-price').text().replace(/\s/g, ''), cur),
                site: URL
            })
        }
    })



    return tempData
}

function getDuration(date1, date2){
    let days = ''
    let month = ''
    let year = ''

    let days2 = ''
    let month2 = ''
    let year2 = ''

    for (let i = 0; i < date1.length; i++){
        if(i < 2){
            days += date1[i]
        }else if(i > 2 && i < 5){
            month += date1[i]
        }else if(i > 5){
            year += date1[i]
        }
    }

    for (let i = 0; i < date2.length; i++){
        if(i < 2){
            days2 += date2[i]
        }else if(i > 2 && i < 5){
            month2 += date2[i]
        }else if(i > 5){
            year2 += date2[i]
        }
    }

    return DateTime.fromISO(year2 + '-' + month2 + '-' + days2).diff(DateTime.fromISO(year + '-' + month + '-' + days), 'days').toObject().days
}

module.exports = getDataProydisvit


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
