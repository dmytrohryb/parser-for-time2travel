const axios = require('axios')
const PohodvoryData = require('./sites/Pohodvgory')
const KuluarpohodData = require('./sites/Kuluarpohod')
const ExtremeguideData = require('./sites/Extremeguide')
const MarshrutclubData = require('./sites/Marshrutclub')
const GreentravelData = require('./sites/Greentravel')
//const VpohodData = require('./sites/Vpohod')
const ProydisvitData = require('./sites/Proydisvit')
/*
const {DateTime} = require("luxon")

const convertDate2 = (date2) => {
    return date2[8] + date2[9] + '.' + date2[5] + date2[6] + '.' + date2[0] + date2[1] + date2[2] + date2[3]
}

const convertDate = (date) => {
    return date[6] + date[7] + date[8] + date[9] + '-' + date[3] + date[4] + '-' + date[0] + date[1]
}
*/
let Parser = async function(){
    const data = []
    let tempData = []
    let cur = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')

    try {
        console.log('start of receiving data from the site - Proydisvit')
        tempData = await ProydisvitData(cur.data)
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Proydisvit site received')
    }catch (err) {
        console.error(err.message)
    }
/*
    try {
        console.log('start of receiving data from the site - Vpohod')
        tempData = await VpohodData(cur.data)
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Vpohod site received')
    }catch (err) {
        console.error(err.message)
    }
*/
    try {
        console.log('start of receiving data from the site - Greentravel')
        tempData = await GreentravelData(cur.data)
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Greentravel site received')
    }catch (err) {
        console.error(err.message)
    }

    try {
        console.log('start of receiving data from the site - Marshrutclub')
        tempData = await MarshrutclubData(cur.data)
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Marshrutclub site received')
    }catch (err) {
        console.error(err.message)
    }

    try {
        console.log('start of receiving data from the site - Extremeguide')
        tempData = await ExtremeguideData(cur.data)
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Extremeguide site received')
    }catch (err) {
        console.error(err.message)
    }

    try {
        console.log('start of receiving data from the site - Pohodvgory')
        tempData = await PohodvoryData(cur.data)
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Pohodvgory site received')
    }catch (err) {
        console.error(err.message)
    }

    try {
        console.log('start of receiving data from the site - Kuluarpohod')
        tempData = await KuluarpohodData()
        for (let i = 0; i < tempData.length; i++){
            data.push(tempData[i])
        }
        console.log('data from the Kuluarpohod site received')
    }catch (err) {
        console.error(err.message)
    }
/*
    for(let i = 0; i < data.length; i++){
        data[i].finishDate = convertDate2(DateTime.fromISO(convertDate(data[i].date)).plus({days: data[i].duration}).toISODate())
    }
*/
    return data
}

module.exports = Parser
