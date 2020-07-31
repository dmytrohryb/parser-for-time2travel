const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://v-pohod.com.ua/'
const SHEDULE = 'raspisanie'

const alphabetRu = ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
                    'А', 'Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я']

function getOnlyRuSymbols(str){
    let result = ''
        for(let i = 0; i < str.length; i++){
            for(let j = 0; j < alphabetRu.length; j++){
                if(str[i] === alphabetRu[j]){
                    result += str[i]
                    break
                }
            }
        }
    return result
}

function getOnlyRuSymbols2(str){
    let result = ''
    for(let i = 0; i < str.length; i++){
        if(str[i] !== '-'){
            for(let j = 0; j < alphabetRu.length; j++){
                if(str[i] === alphabetRu[j]){
                    result += str[i]
                    break
                }
            }
        }else{
            break
        }
    }
    return result
}

function getOnlyDate(str){
    let res = ''
    for (let i = 0; i < str.length; i++){
        if(str[i] !== '('){
            res += str[i]
        }else {
            break
        }
    }
    return res
}

function reverseDate(str) {
    let newStr = str.replace(/\./g, '-')

    return newStr
}



function getCountMonth(str){

    let count = 0

    if(str.match(/января/g)){
        count++
    }
    if(str.match(/февраля/g)){
        count++
    }
    if(str.match(/марта/g)){
        count++
    }
    if(str.match(/апреля/g)){
        count++
    }
    if(str.match(/мая/g)){
        count++
    }
    if(str.match(/июня/g)){
        count++
    }
    if(str.match(/июля/g)){
        count++
    }
    if(str.match(/августа/g)){
        count++
    }
    if(str.match(/сентября/g)){
        count++
    }
    if(str.match(/октября/g)){
        count++
    }
    if(str.match(/ноября/g)){
        count++
    }
    if(str.match(/декабря/g)){
        count++
    }

    return count
}

async function getData2(url) {
    let tempData = []
    let count = 0
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    let durations = []

    $('div.elementor-text-editor p').each((i, elem) => {
        if($(elem).find('span').text().match(/Продолжительность/g)){
            durations = getDurationOnlyNum($(elem).find('span').text().substr(19, $(elem).find('span').text().length))
        }
    })


    $('table tr').each((i, elem) => {
        count = getCountMonth(getOnlyDate($(elem).find('td:nth-child(1)').text()))
        if(count === 1){

            tempData.push({
                date: getOnlyDayNumber(getOnlyDate($(elem).find('td:nth-child(1)').text())) + parseDate(getOnlyDate($(elem).find('td:nth-child(1)').text()), true),
                duration: durations
            })
        }
        if(count === 2){

            tempData.push({
                date: getOnlyDayNumber(getOnlyDate($(elem).find('td:nth-child(1)').text())) + parseDate(getOnlyDate($(elem).find('td:nth-child(1)').text()), false),
                duration: durations
            })
        }
    })

    return tempData

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
async function getList(url, cur){
    let tempData = []
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    $('table tr').each((i, elem) => {
        if($(elem).find('td:nth-child(2)').text() !== ''){
            if(!$(elem).find('td:nth-child(2) a').attr('href').match('facebook')){
                tempData.push({
                    site: URL,
                    title: $(elem).find('td:nth-child(2) a').text(),
                    link: URL + $(elem).find('td:nth-child(2) a').attr('href'),
                    location: $(elem).find('td:nth-child(3) a').text(),
                    price: getPriceOnlyNum($(elem).find('td:nth-child(4)').text(), cur)
                })
            }
        }
    })

    return tempData
}

async function getDataVpohod(cur) {
    let tempList = await getList(URL + SHEDULE, cur)

    let tempData = []
    for (let i = 0; i < tempList.length; i++){
        let tempdata = await getData2(encodeURI(tempList[i].link))
        for (let j = 0; j < tempdata.length; j++){

            tempData.push({
                date: tempdata[j].date,
                duration: tempdata[j].duration,
                title: tempList[i].title,
                link: tempList[i].link,
                site: tempList[i].site,
                location: tempList[i].location,
                price: tempList[i].price
            })
        }
    }
    return tempData

}


module.exports = getDataVpohod

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

function getOnlyDayNumber(str) {
    let day = ''
    for(let i = 0; i < str.length; i++){
        if(Number.isInteger(parseInt(str[i]))){
            day += str[i]
        }else{
            break
        }
    }
    if(day.length === 1){
        return '0' + day + '.'
    }else{
        return day + '.'
    }

}

function parseDate(str, firstMetod){

    let monthName = ''
    if(firstMetod){
        monthName = getOnlyRuSymbols(str)
    }else{
        monthName = getOnlyRuSymbols2(str)
    }

    let year = str.substr(str.length - 5, str.length - 1).replace(/\s/g, '')
    let month = ''

    switch (monthName) {
        case 'января':
            month = '01'
            break
        case 'февраля':
            month = '02'
            break
        case 'марта':
            month = '03'
            break
        case 'апреля':
            month = '04'
            break
        case 'мая':
            month = '05'
            break
        case 'июня':
            month = '06'
            break
        case 'июля':
            month = '07'
            break
        case 'августа':
            month = '08'
            break
        case 'сентября':
            month = '09'
            break
        case 'октября':
            month = '10'
            break
        case 'ноября':
            month = '11'
            break
        case 'декабря':
            month = '12'
            break
    }
    if(month + '.' + year !== '.'){
        return month + '.' + year
    }
}



let now = new Date()
let date = new Date('1997-06-01')

if(now > date){
    console.log(date)
    console.log(now)
}
