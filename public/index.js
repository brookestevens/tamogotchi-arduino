//////////////////////////////////////////////////////
//  Tamogotchi Simulator with minigames
//  Using fetch API to make requests
//
/////////////////////////////////////////////////////

//object to hold the DB response
//maximum stats are 10 
var stat = { food: "", love: "", hygiene: "", gameWasPlayed: false };
var serial; //variable to hold an instance of the serial port library
var portName = '/dev/cu.usbmodem14201'; //fill in with YOUR port
var inData, outString;
var clicked = true;

//parse the data
function serialEvent(){
  inData = serial.readLine();
  console.log("in data is: ", inData);
  if( clicked === true && inData === '290068F8D069'){
    clicked = false;
    location.replace('http://localhost:8000/feedMe','_self');
  }
  // if( clicked === true && inData === '---------------'){
  //   clicked = false;
  //   location.replace('http://localhost:8000/cleanMe','_self');
  // }
  // if( clicked === true && inData === '----------------'){
  //   clicked = false;
  //   window.open('http://localhost:8000/attention','_self');
  // }
}

// set up the animations 
var sequenceAnimation;
var glitch;
var expression;
var fps;

function preload() {
  angry = loadAnimation("assets/angry-1.png", "assets/angry-2.png");
  bashful = loadAnimation("assets/bashful-1.png", "assets/bashful-2.png");
  cry = loadAnimation("assets/cry-1.png", "assets/cry-2.png");
  idle = loadAnimation("assets/idle-1.png", "assets/idle-2.png");
  disappointed = loadAnimation("assets/disappointed-1.png", "assets/disappointed-2.png");
  shiver = loadAnimation("assets/shiver-1.png", "assets/shiver-2.png");
  sick = loadAnimation("assets/sick-1.png", "assets/sick-2.png");
  dead = loadAnimation("assets/dead-1.png", "assets/dead-2.png");
  pout = loadAnimation("assets/pout-1.png", "assets/pout-2.png");
  nightmare = loadAnimation("assets/nightmare-1.png", "assets/nightmare-2.png");
  lick = loadAnimation("assets/lick-1.png", "assets/lick-2.png");
  bath = loadAnimation("assets/bath-1.png", "assets/bath-2.png");
  wave = loadAnimation("assets/wave-1.png", "assets/wave-2.png", "assets/wave-3.png");
  happywalk = loadAnimation("assets/happy-walk-1.png", "assets/happy-walk-2.png", "assets/happy-walk-3.png");
  
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  background('#BAE1FF'); //powder blue
  serial = new p5.SerialPort(); //a new instance of serial port library

  //set up events for serial communication / debuggging information
  serial.on('connected', () => console.log("Connected to the server"));
  serial.on('open', () => console.log("The serial port opened!"));
  serial.on('data', serialEvent);
  serial.on('error', (err) => console.log("something went wrong with the port " + err));
  serial.on('close', () => console.log("The port closed"));

  //open our serial port
  serial.open(portName);


  //update the DB
  fetch('/display')
  .then(res => res.json())
  .then(function(res) {
      stat.food = res.info.food;
      stat.love = res.info.love;
      stat.hygiene = res.info.hygiene;
      stat.gameWasPlayed = res.info.gameplayed;
      console.table(res.info);
      outString = `${res.info.food}${res.info.love}${res.info.hygiene}`;

      //send the LED values out to the Arduino
      //console.log("string to send: ", outString);
      serial.write(outString);
  })
  .catch(res => console.log(res))

}


function draw(){
    background('#BAE1FF'); //powder blue
    rect(20,20,400,400,20);
    //STATS:
    textSize(32); //size
    text(`Affection: ${stat.love}`, 10, 60); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Cleanliness: ${stat.hygiene}`, 10, 90); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Hunger: ${stat.food}`, 10, 30); //string and position
    fill(150, 102, 153); //color of word
    text(`Mimitchi`, 300, 30); //string and position
    fill(150, 102, 153); //color of word
  
    translate(50, 100);
    getAnimation();
}


function animate(expression, frames){
  fps = frames;
  animation(expression, 150, 150);
  expression.frameDelay = 60/fps;
}

function getAnimation(){
  var totals = +stat.love + +stat.food + +stat.hygiene;
  if(stat.food <= 4){
    animate(angry, 1);
  }
  else if(stat.love <= 4){
    animate(pout,1);
  }
  else if(stat.hygiene <= 4){
    animate(bath, 1);
  }
  else if(totals === 0) {
    animate(dead, 1);
  }
  else if(totals === 24){
    animate(lick, 1);
  }
}





