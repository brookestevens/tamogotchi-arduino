//////////////////////////////////////////////////////
//  Tamogotchi Simulator with minigames
//  Home page with stats and animations
//  Using P5 serial port and P5 game library for animations
//  FIGURE OUT TIME DIFF FUNCTION
//
/////////////////////////////////////////////////////

//object to hold the DB response
var stat = { food: "", love: "", hygiene: ""};
var serial; //variable to hold an instance of the serial port library
var portName = '/dev/cu.usbmodem14201';
var inData, outString;
var clicked = true;

// set up the animations 
var sequenceAnimation, glitch, expression, fps;

//parse the incoming RFID tag and redirect to mapped page
function serialEvent(){
  inData = serial.readLine();
  console.log("in data is: ", inData);
  if( clicked === true && inData === '2B009FE8277B'){
    clicked = false;
    location.replace('http://localhost:8000/feedMe','_self');
  }
  if( clicked === true && inData === '2B009FD7395A'){
    clicked = false;
    location.replace('http://localhost:8000/cleanMe','_self');
  }
  if( clicked === true && inData === '2B009F8D0D34'){
    clicked = false;
    window.open('http://localhost:8000/attention','_self');
  }
}

//load in the animations
function preload() {
  angry = loadAnimation("public/assets/angry-1.png", "public/assets/angry-2.png");
  bashful = loadAnimation("public/assets/bashful-1.png", "public/assets/bashful-2.png");
  cry = loadAnimation("public/assets/cry-1.png", "public/assets/cry-2.png");
  idle = loadAnimation("public/assets/idle-1.png", "public/assets/idle-2.png");
  disappointed = loadAnimation("public/assets/disappointed-1.png", "public/assets/disappointed-2.png");
  shiver = loadAnimation("public/assets/shiver-1.png", "public/assets/shiver-2.png");
  sick = loadAnimation("public/assets/sick-1.png", "public/assets/sick-2.png");
  dead = loadAnimation("public/assets/dead-1.png", "public/assets/dead-2.png");
  pout = loadAnimation("public/assets/pout-1.png", "public/assets/pout-2.png");
  nightmare = loadAnimation("public/assets/nightmare-1.png", "public/assets/nightmare-2.png");
  lick = loadAnimation("public/assets/lick-1.png", "public/assets/lick-2.png");
  bath = loadAnimation("public/assets/bath-1.png", "public/assets/bath-2.png");
  wave = loadAnimation("public/assets/wave-1.png", "public/assets/wave-2.png", "public/assets/wave-3.png");
  happywalk = loadAnimation("public/assets/happy-walk-1.png", "public/assets/happy-walk-2.png", "public/assets/happy-walk-3.png");
  
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
  fetch('/display',{
    headers: {"Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(function(res) {
      stat.food = res.info.food;
      stat.love = res.info.love;
      stat.hygiene = res.info.hygiene;
      outString = `${res.info.food}${res.info.love}${res.info.hygiene}`;
      console.table(res.info);
      //send the LED values out to the Arduino
      //console.log("string to send: ", outString);
      serial.write(outString);
  })
  .catch(err => console.log("Error: ", err))

}

//loop the stats and animations
function draw(){
    background('#BAE1FF'); //powder blue
    rect(20,100,400,400,20);
    //STATS:
    textSize(32); //size
    fill(150, 102, 153); //color of words
    text(`Happiness: ${stat.love}`, 10, 60); //string and position
    textSize(32); //size
    text(`Cleanliness: ${stat.hygiene}`, 10, 90); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Hunger: ${stat.food}`, 10, 30); //string and position
    fill(150, 102, 153); //color of word
    fill(150, 102, 153); //color of word
    text(`ATLS 3300 - Object`, 300, 30); //string and position

    //Instructions
    textSize(30); //size
    fill(150, 102, 153); //color of words
    text(`Scan a plushy to take care of Mimitchi!`, 450, 150); //string and position
    textSize(30); //size
    text(`Cake: Feed Mimitchi`, 450, 200); //string and position
    text(`Duck Ring: Clean Mimitchi`, 450, 250); //string and position
    text(`Heart: Pet Mimitchi`, 450, 310); //string and position
  
    translate(80, 150);
    getAnimation();
}

function animate(expression, frames){
  fps = frames;
  animation(expression, 150, 150);
  expression.frameDelay = 60/fps;
}

function getAnimation(){
  var totals = +stat.love + +stat.food + +stat.hygiene;
  
  if(totals === 0) {
    animate(dead, 1);
  }
  else if(totals === 24){
    animate(lick, 1);
  }
  else if(stat.food <= 3){
    animate(angry, 1);
  }
  else if(stat.love <= 3){
    animate(pout,1);
  }
  else if(stat.hygiene <= 3){
    animate(bath, 1);
  }
  else if(totals >= 16 && totals < 24){
    animate(happywalk,1);
  }
  //default animation
  else{
    animate(ide,1);
  }
}






