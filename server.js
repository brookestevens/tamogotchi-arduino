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

//Serve up the directories
app.use(express.static(__dirname + '/public'));
app.use('/games', express.static(__dirname + '/games'));

app.get('/p5.play.js', (req,res) => {
  res.sendFile(path.join(__dirname,'/p5.play.js'));
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
    res.send({
      info : data[0]
    })
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

app.listen(port, () => console.log(`App is listening on port ${port}!`));
