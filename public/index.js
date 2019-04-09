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
    //redirect player
    window.open('http://localhost:8000/feedMe.html','_self');
  }
  //if (clicked == true && inData === "2B009F8D0D34")
}


//load in the stats before anything else gets rendered
// function preload(){

// }

function setup(){
  createCanvas(windowWidth, windowHeight);
  background(0);
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

//only for testing 
function keyPressed() {
  // Do something
  if(key == 'q'){
    console.log("pressed");
    window.open('http://localhost:8000/feedMe.html', '_self'); //open window in same tab
  }
  return false; // prevent any default behaviour
}

function draw(){
    square(10,10,10);
    fill(120,12,123);
    //data vis:
    textSize(32); //size
    text(`Affection: ${stat.love}`, 10, 60); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Cleanliness: ${stat.hygiene}`, 10, 90); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Hunger: ${stat.food}`, 10, 30); //string and position
    fill(150, 102, 153); //color of word

    if(stat.love > 0 && stat.love < 2){
      //display some animation
    }
    //do that for all animation combos
}


