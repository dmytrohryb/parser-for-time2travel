const Parser = require('./src/parser')
const express = require('express')
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to database.');
});

Parser()
    .then(res => {
        for(let i = 0; i < res.length; i++){
            db.run('insert into tours(title, date, duration, link, location, price)values(?,?,?,?,?,?)', [res[i].title, res[i].date, res[i].duration, res[i].link, res[i].location, res[i].price], function (err){
                    if(err) {
                        return console.error(err.message)
                    }
                console.log(`A row has been inserted with rowid ${this.lastID}`)
                })
        }
    })
    .catch(err => {
        console.error(err.message)
    })

