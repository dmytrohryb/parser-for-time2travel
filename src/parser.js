const PohodvoryData = require('./sites/Pohodvgory')
const axios = require('axios')
const KuluarpohodData = require('./sites/Kuluarpohod')
let Parser = async function(){
    const data = []
    let tempData = []
    let cur = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')

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

    return data
}

module.exports = Parser
