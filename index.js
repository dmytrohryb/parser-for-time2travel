const Parser = require('./src/parser')
const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

let db = new sqlite3.Database('./data', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to database.');
});

setInterval(getData, 10000)

async function getData (){
    let res = await Parser()
    db.run('delete from tours', function (err){
        if(err){
            return console.error(err.message)
        }
    })
    for(let i = 0; i < res.length; i++){
        db.run('insert into tours(title, date, duration, link, location, price)values(?,?,?,?,?,?)',
            [res[i].title, res[i].date, res[i].duration, res[i].link, res[i].location, res[i].price],
            function (err){
            if(err) {
                return console.error(err.message)
            }
        })
    }

    console.log('data updated')
}

app.listen(port, () => {
    console.log(port)
});

app.post("/", function(request, response){
    if(request.body.date && request.body.duration && request.body.price){
        db.all(`SELECT * from tours WHERE date = ${request.body.date} AND duration = ${request.body.duration} AND price > ${request.body.price.min} AND price < ${request.body.price.max} LIMIT 15 OFFSET`, (err, rows ) => {
            console.log('test')
            response.send(rows);
        });
    }
    console.log('end post query')
});
