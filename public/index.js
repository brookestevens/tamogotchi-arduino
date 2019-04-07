//////////////////////////////////////////////////////
//  Tamogotchi Simulator with minigames
//  Using fetch API to make requests
//
/////////////////////////////////////////////////////

//object to hold the DB response
//maximum stats are 10 
var stat = { food: 0, love: 0, hygiene: 0 };
var serial; //variable to hold an instance of the serial port library
var portName = '/dev/cu.usbmodem14201'; //fill in with YOUR port
var inData;
var clicked = true;



//parse the data
function serialEvent(){
  //this is the same as readStringUntil("\r\n");
  //return and newline
  inData = serial.read();
  console.log(inData);
  if(inData == clicked){
      //do something
      var random = Math.floor(Math.random() * (60 - 1)) + 1;
      console.log(random);
      serial.write(random);
      clicked = false;
  }
}


//load in the stats before anything else gets rendered
function preload(){
    fetch('/display')
    .then(res => res.json())
    .then(function(res) {
        stat.food = res.info.food;
        stat.love = res.info.love;
        stat.hygiene = res.info.hygiene;
        console.log(JSON.stringify(res.info.food));
    })
    .then(res => {
        //some p5 code here
    })
    .catch(res => console.log(res))
}

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
}

function draw() {
    textSize(32); //size
    text(`Hunger: ${stat.food}`, 10, 30); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Affection: ${stat.love}`, 10, 60); //string and position
    fill(150, 102, 153); //color of words
    textSize(32); //size
    text(`Cleanliness: ${stat.hygiene}`, 10, 90); //string and position
    fill(150, 102, 153); //color of words
    
    square(150,150,500); //location of square 
    fill(150,120,155); //color of square
    square(800,150,500);
    fill(150,120,155);

     clicked = true;

    // switch(condition){
    //     case 1 :
    //         //activite first game
    //         break;
    //     case 2 :
    //         //activate second game
    //         break;
    //     case 3 :
    //         //activate 3rd game
    //         break;
    //     default:
    //         //default code here
    // } 
}
