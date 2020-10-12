const Parser = require('./src/parser')
const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000;
const app = express();
const {DateTime} = require("luxon")

const convertDate2 = (date2) => {
    return date2[8] + date2[9] + '.' + date2[5] + date2[6] + '.' + date2[0] + date2[1] + date2[2] + date2[3]
}

const convertDate = (date) => {
    return date[6] + date[7] + date[8] + date[9] + '-' + date[3] + date[4] + '-' + date[0] + date[1]
}

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

let db = new sqlite3.Database('./data', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    start()
    console.log('Connected to database.');
});

function start(){
    getData();
    setInterval(getData, 1000*60*60*24)
}

async function getData (){
    let res = await Parser()
    db.run('delete from tours', function (err){
        if(err){
            return console.error(err.message)
        }
    })
    for(let i = 0; i < res.length; i++){
        db.run('insert into tours(title, site, date, duration, link, location, price, finishDate)values(?,?,?,?,?,?,?,?)',
            [res[i].title, res[i].site, res[i].date, res[i].duration, res[i].link, res[i].location, res[i].price, res[i].finishDate],
            function (err){
                if(err) {
                    return console.error(err.message)
                }
            })
    }

    console.log('data updated successful')
}

app.listen(port, () => {
    console.log('server listen port: ' + port)
});



app.post("/", function(request, response){
    let {startDate, cost, finishDate} = request.body

    db.all(`SELECT * from tours`, (err, rows) => {
        let res = []

        if (startDate === '' && finishDate === '' && cost.min === '' && cost.max === '') {
            response.send(rows)
        }

        if(startDate === '' && finishDate === '' && cost.min !== '' && cost.max === ''){
            rows.forEach(elem => {
                if(parseInt(cost.min) <= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate === '' && finishDate === '' && cost.min !== '' && cost.max !== ''){
            rows.forEach(elem => {
                if(parseInt(cost.min) <= elem.price && parseInt(cost.max) >= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate === '' && finishDate === '' && cost.min === '' && cost.max !== ''){
            rows.forEach(elem => {
                if(parseInt(cost.max) >= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate !== '' && finishDate !== '' && cost.min === '' && cost.max === ''){
            let duration = DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days
            for (let i = 0; i < DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days; i++) {
                let date = convertDate2(DateTime.fromISO(convertDate(startDate)).plus({days: i}).toISODate())
                rows.forEach(elem => {
                    if (date === elem.date && elem.duration <= duration) {
                        res.push(elem)
                    }
                })
                duration--
            }
            response.send(res)
        }

        if(startDate !== '' && finishDate !== '' && cost.min !== '' && cost.max === ''){
            let duration = DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days
            for (let i = 0; i < DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days; i++) {
                let date = convertDate2(DateTime.fromISO(convertDate(startDate)).plus({days: i}).toISODate())
                rows.forEach(elem => {
                    if (date === elem.date && elem.duration <= duration && parseInt(cost.min) <= elem.price) {
                        res.push(elem)
                    }
                })
                duration--
            }
            response.send(res)
        }

        if(startDate !== '' && finishDate !== '' && cost.min !== '' && cost.max !== ''){
            let duration = DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days
            for (let i = 0; i < DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days; i++) {
                let date = convertDate2(DateTime.fromISO(convertDate(startDate)).plus({days: i}).toISODate())
                rows.forEach(elem => {
                    if (date === elem.date && elem.duration <= duration && parseInt(cost.min) <= elem.price && parseInt(cost.max) >= elem.price) {
                        res.push(elem)
                    }
                })
                duration--
            }
            response.send(res)
        }

        if(startDate !== '' && finishDate !== '' && cost.min === '' && cost.max !== ''){
            let duration = DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days
            for (let i = 0; i < DateTime.fromISO(convertDate(finishDate)).diff(DateTime.fromISO(convertDate(startDate)), 'days').toObject().days; i++) {
                let date = convertDate2(DateTime.fromISO(convertDate(startDate)).plus({days: i}).toISODate())
                rows.forEach(elem => {
                    if (date === elem.date && elem.duration <= duration && parseInt(cost.max) >= elem.price) {
                        res.push(elem)
                    }
                })
                duration--
            }
            response.send(res)
        }

        if(startDate === '' && finishDate !== '' && cost.min === '' && cost.max === ''){
            rows.forEach(elem => {
                let date = DateTime.fromISO(convertDate(elem.date)).plus({days: elem.duration}).toISODate()
                if (DateTime.fromISO(convertDate(finishDate)) >= DateTime.fromISO(date)) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate === '' && finishDate !== '' && cost.min !== '' && cost.max === ''){
            rows.forEach(elem => {
                let date = DateTime.fromISO(convertDate(elem.date)).plus({days: elem.duration}).toISODate()
                if (DateTime.fromISO(convertDate(finishDate)) >= DateTime.fromISO(date) && parseInt(cost.min) <= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate === '' && finishDate !== '' && cost.min !== '' && cost.max !== ''){
            rows.forEach(elem => {
                let date = DateTime.fromISO(convertDate(elem.date)).plus({days: elem.duration}).toISODate()
                if (DateTime.fromISO(convertDate(finishDate)) >= DateTime.fromISO(date) && parseInt(cost.min) <= elem.price && parseInt(cost.max) >= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate === '' && finishDate !== '' && cost.min === '' && cost.max !== ''){
            rows.forEach(elem => {
                let date = DateTime.fromISO(convertDate(elem.date)).plus({days: elem.duration}).toISODate()
                if (DateTime.fromISO(convertDate(finishDate)) >= DateTime.fromISO(date) && parseInt(cost.max) >= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate !== '' && finishDate === '' && cost.min === '' && cost.max === ''){
            rows.forEach(elem => {
                if (DateTime.fromISO(convertDate(startDate)) <= DateTime.fromISO(convertDate(elem.date))) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate !== '' && finishDate === '' && cost.min !== '' && cost.max === ''){
            rows.forEach(elem => {
                if (DateTime.fromISO(convertDate(startDate)) <= DateTime.fromISO(convertDate(elem.date)) && parseInt(cost.min) <= elem.price ) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate !== '' && finishDate === '' && cost.min !== '' && cost.max !== ''){
            rows.forEach(elem => {
                if (DateTime.fromISO(convertDate(startDate)) <= DateTime.fromISO(convertDate(elem.date)) && parseInt(cost.min) <= elem.price && parseInt(cost.max) >= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

        if(startDate !== '' && finishDate === '' && cost.min === '' && cost.max !== ''){
            rows.forEach(elem => {
                if (DateTime.fromISO(convertDate(startDate)) <= DateTime.fromISO(convertDate(elem.date)) && parseInt(cost.max) >= elem.price) {
                    res.push(elem)
                }
            })
            response.send(res)
        }

    })
})

