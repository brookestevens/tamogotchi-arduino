/////////////////////////////////////////////////
//
//  REQUIRED EXPRESS MODULES:
//  Express - define the routes
//  pg-promise - make database calls
//  path - serve up static files and directories
//  Arduino serial listens on port 8081 - app listens on port 8000
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

var stats = {
  food: '',
  love: '',
  hygiene: ''
}

var db = pgp(dbConfig);

//Serve up the directories
app.use('/public', express.static(__dirname + '/public'));
app.use('/games', express.static(__dirname + '/games'));

//set up home page
app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,'public/index.html'));
});

//set up route for feeding the tamogotchi
app.get('/feedMe', (req,res) => {
  res.sendFile(path.join(__dirname,'games/test.html'));
});

//set up route for cleaning the tamogotchi
app.get('/cleanMe', (req,res) => {
  res.sendFile(path.join(__dirname,'games/clean.html'));
});

//set up route for giving tamogotchi affection
app.get('/attention', (req,res) => {
  res.sendFile(path.join(__dirname,'games/love.html'));
});

//Set up the routes to handle the stats of the tamogotchi
app.get('/display', (req, res) => { 
db.any('SELECT * FROM stats WHERE id=2;')
  .then( data => {
    stats.love = data[0].love;
    stats.hygiene = data[0].hygiene;
    stats.food = data[0].food;
    res.send({info : data[0]})
  })
  .catch(e => console.log(e))
});

//update our DB once people finish a game
app.get('/update', (req, res) => {
  var colName = req.query.column;
  var newValue = req.query.value;
  console.log(`UPDATE stats SET ${colName} = ${newValue} WHERE id=2;`);
  //check if the stats are at a maximum
  if(newValue > 8) newValue = 8;

  db.task('get-everything', task => {
    return task.batch([
        task.any(`UPDATE stats SET ${colName} = ${newValue} WHERE id=2;`) //no return from this query
    ]);
  })
  res.send({"express": "success"}) //send this success message back
})

//decrease the stats every 5 min
// var count = 0;
// setInterval(function(){
//   console.log("working: ", count++);
//   stats.food ? --stats.food : ++stats.food;
//   stats.love ? --stats.love : ++stats.love;
//   stats.hygiene ? --stats.hygiene : ++stats.hygiene;
//   console.log(`${stats.food} and ${stats.love} and ${stats.hygiene}`);
//   db.any(`UPDATE stats SET food = ${stats.food}, love = ${stats.love}, hygiene = ${stats.hygiene} WHERE id = 2`)
//   .catch(e => console.log(e))
// },60000);

app.listen(port, () => console.log(`App is listening on port ${port}!`));
