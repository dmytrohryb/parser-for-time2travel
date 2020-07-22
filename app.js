const Parser = require('./src/parser')
const express = require('express')
const sqlite3 = require('sqlite3').verbose();

const app = express();

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

    console.log('blablabla')
}

app.listen(3000);

app.get("/", function(request, response){
    db.all('SELECT * from tours', (err, rows ) => {
        console.log('test')
        response.send(rows);
    });
});
