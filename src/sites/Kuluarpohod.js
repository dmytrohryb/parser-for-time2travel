const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://kuluarpohod.com'
const SHEDULE = '/routes/table/'

async function getRoutes(cur) {
    const tempData = []
    const response = await axios.get(URL + SHEDULE)
    const $ = cheerio.load(response.data)
    $('div.main-content table.dynamic_table_hike tr.hike_item').each((i, elem) => {
        tempData.push({
            date: $(elem).find('td:nth-child(1)').text().substr(0, 5),
            title: $(elem).find('td:nth-child(2) a').text(),
            link: URL + $(elem).find('td:nth-child(2) a').attr('href'),
            price: getPriceOnlyNum($(elem).find('td:nth-child(5)').text().replace(/\s/g, ''), cur.data),
            location: $(elem).find('td:nth-child(3)').text(),
        })
    })
    return tempData
}

async function getDurationAndDate(link, date){
    const response = await axios.get(link)
    const $ = cheerio.load(response.data)

    let date2
    let dur

    $('div.desk-param div').each((i, elem) => {
        if($(elem).text().replace(/\s/g, '').match(/тельность:/g)){
            dur = getDurationOnlyNum($(elem).text().replace(/\s/g, ''))
        }
    })

    $('table.shedule-hikes tr.hikes_three_nochange').each((i, elem) => {
        if($(elem).find('td:nth-child(1) span.hike-entry-date').text().replace(/\s/g, '').substr(0, 5) === date){
            date2 = $(elem).find('td:nth-child(1) span.hike-entry-date').text().replace(/\s/g, '').substr(0,5) + $(elem).find('td:nth-child(1) span.hike-entry-date').text().replace(/\s/g, '').substr($(elem).find('td:nth-child(1) span.hike-entry-date').text().replace(/\s/g, '').length - 5,$(elem).find('td:nth-child(1) span.hike-entry-date').text().replace(/\s/g, '').length)
        }
    })

    return {date: date2, duration: dur}
}

async function getDataKuluarpohod(){
    let cur = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
    let routes = await getRoutes(cur)

    let durationsAndDate = []
    let result = []

    for (let i = 0; i < routes.length; i++){
        durationsAndDate.push(await getDurationAndDate(routes[i].link, routes[i].date))
    }

    for (let i = 0; i < routes.length; i++){
        result.push({
            date: durationsAndDate[i].date,
            site: 'https://kuluarpohod.com',
            title: routes[i].title,
            link: routes[i].link,
            price: routes[i].price,
            location: routes[i].location,
            duration: durationsAndDate[i].duration
        })
    }

    return result
}

let getDurationOnlyNum = (duration) => {
    let _duration = ''
    for (let i = 0; i < duration.length; i++){
        if(Number.isInteger(parseInt(duration[i]))){
            _duration += duration[i]
        }
    }

    return _duration
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

module.exports = getDataKuluarpohod

/*
async function getDurationAndDate(link, date){
    const response = await axios.get(link)
    const $ = cheerio.load(response.data)
    let temp
    $('table.shedule-hikes tr.hikes_three_nochange td span.hike-entry-date').each((i, elem) => {
        if($(elem).text().substr(0,5) === date){
            temp = {
                duration: getDurationOnlyNum($('div.desk_param div.param_value').text()),
                date: getDateText($(elem).text().substr(0,5))
            }
        }
    })


    return temp
}




 $('table.shedule-hikes tr.hikes_three_nochange').each((i, elem) => {
        let date2 = $(elem).find('td:nth-child(1) span.hike-entry-date').text().replace(/\s/g, '')
        if(date2.substr(0, 5) === date){
            return date2.substr(0, 5) + date2.substr(date2.length - 5, 5)
        }
    })
 */
