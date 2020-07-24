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
        db.run('insert into tours(title, date, duration, link, location, price)values(?,?,?,?,?,?)',
            [res[i].title, res[i].date, res[i].duration, res[i].link, res[i].location, res[i].price],
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
    let {duration, cost, date} = request.body
    if(date !== ''){
        if(duration !== 0 && cost.min === '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE date = ? AND duration < ?`, [date, duration], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min === '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE date = ?`, [date], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min !== '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE date = ? AND price < ? AND price > ?`, [date, cost.max, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min === '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE date = ? AND price < ?`, [date, cost.max], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min !== '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE date = ? AND price > ?`, [date, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration !== 0 && cost.min !== '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE date = ? AND duration < ? AND price < ? AND price > ?`, [date, duration, cost.max, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            })
        }else if(duration !== 0 && cost.min !== '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE date = ? AND duration < ? AND price > ?`, [date, duration, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            })
        }else if(duration !== 0 && cost.min === '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE date = ? AND duration < ? AND price < ?`, [date, duration, cost.max], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            })
        }

    }else{
        if(duration !== 0 && cost.min === '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE duration < ?`, [duration], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min === '' && cost.max === ''){
            db.all(`select * from tours`, (err, rows ) => {
                response.send(rows);
            });
        }else if(duration === 0 && cost.min !== '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE price < ? AND price > ?`, [cost.max, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min === '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE price < ?`, [cost.max], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration === 0 && cost.min !== '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE price > ?`, [cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            });
        }else if(duration !== 0 && cost.min !== '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE duration < ? AND price < ? AND price > ?`, [duration, cost.max, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            })
        }else if(duration !== 0 && cost.min !== '' && cost.max === ''){
            db.all(`SELECT * from tours WHERE duration < ? AND price > ?`, [duration, cost.min], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            })
        }else if(duration !== 0 && cost.min === '' && cost.max !== ''){
            db.all(`SELECT * from tours WHERE duration < ? AND price < ?`, [duration, cost.max], (err, rows ) => {
                console.log(rows)
                response.send(rows);
            })
        }

    }
});
