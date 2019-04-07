/////////////////////////////////////////////////
//
//  Express - define the routes
//  pg-promise - make database calls
//  Running on port 8080 so the p5 serial port can connect to it
//
////////////////////////////////////////////////

var express = require('express');
var app = express();
var path = require('path');
var pgp = require('pg-promise')();
const port = 8000;  //p5 serial listens on this port

const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'tamogotchi', //DB name here
	user: 'brookestevens', //Username here
	password: 'postgres' //Password
};

var db = pgp(dbConfig);

//set up a route to serve up the html/JS pages
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'public/index.html'));
});
app.get('/index.js', (req,res) => {
  res.sendFile(path.join(__dirname,'public/index.js'));
});

//set up the p5-serial-port library all user defined files
app.get('/p5.serialport.js', (req,res) => {
  res.sendFile(path.join(__dirname,'public/p5.serialport.js'));
});

//Set up the routes to handle the stats of the tamogotchi
app.get('/display', (req, res) => { 
db.any('SELECT * FROM stats;')
  .then( data => {
    res.send({
      info : data[0]
    })
  })
  .catch(e => console.log(e))
});

//update our DB once people finish a game
app.get('/update', (req, res) => {
  var love = req.query.love;
  var hygiene = req.query.hygiene;
  var food = req.query.food;

  db.task('get-everything', task => {
    return task.batch([
        task.any(`UPDATE stats SET food = ${food}, love = ${love}, hygiene = ${hygiene} WHERE id = 1;`),
        task.any("SELECT * FROM stats;")
    ]);
  })
    .then( data => {
      res.send({
        updated : data[0],
        info : data[1]
      })
    })
    .catch (e => console.log(e))
})

app.listen(port, () => console.log(`App is listening on port ${port}!`));
