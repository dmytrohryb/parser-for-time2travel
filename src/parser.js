const PohodvoryData = require('./sites/Pohodvgory')
const axios = require('axios')

let Parser = async function(){
    const data = []
    let tempData = []
    let cur = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')

    tempData = await PohodvoryData(cur.data)
    for (let i = 0; i < tempData.length; i++){
        data.push(tempData[i])
    }

    return data
}

module.exports = Parser
