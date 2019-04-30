//asteroid clone (core mechanics only)
//arrow keys to move + x to shoot

var mimiImg, mimi, barriers;
var love = 0;
var sec = 0;
var gameover = false;
var gameRestart = false;
var begin = false;

function serialEvent(){
    inData = +serial.read();
    if(inData === 1 && begin == false){ //start game after half a second
      if(gameRestart === true){ //restart the game if failed by page refresh
        location.reload();
      }
      else{ //begin the game 
          begin = true;   
      }  
    }
    if( inData === 4){ //UP BUTTON
        mimi.position.y -= .5;
    }
    if( inData === 3){ //Down button
        mimi.position.y += .5;
    }
}

//set ip the DB
function preload(){
    fetch('/display',{
      headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(function(res) {
        love = res.info.love;
    })
    .catch(res => console.log(res))
  }

function setup() {
  serial = new p5.SerialPort(); //a new instance of serial port library

  //set up events for serial communication / debuggging information
  serial.on('connected', () => console.log("Connected to the server"));
  serial.on('open', () => console.log("The serial port opened!"));
  serial.on('data', serialEvent);
  serial.on('error', (err) => console.log("something went wrong with the port " + err));
  serial.on('close', () => console.log("The port closed"));

  //open our serial port
  serial.open('/dev/cu.usbmodem14201');
    
  createCanvas(500, 400);
  mimiImg = loadImage('games/assets-game3/duck-1.png');
  mimi = createSprite(50, height/2);
  mimi.maxSpeed = 6;
  mimi.friction = 0.98;
  mimi.setCollider('circle', 0, 0, 20);
  
  mimi.addImage('normal', mimiImg);
  barriers = new Group();

  for(var i = 0; i<15; i++) {
    var px = random(width, width*3);
    var py = random(10, height - 10);
    createBarriers(2, px, py);  
  } 
}

function draw() {
  background(131, 134, 247);
  fill(255);
  textAlign(CENTER);
  text('Avoid the asteroids. Up and down.', width/2, 20);
    drawSprites();
    sec = round(frameCount/10);
    mimi.overlap(barriers, mimiHit);
    
    if(sec >= 50 && gameover == false){
        noLoop();
        mimi.remove();
        barriers.removeSprites();
        barriers.clear();
        fill('#BAE1FF');
        textSize(30);
        text("You pet Mimitchi!",width/2, height/2);
        setTimeout(function(){
            serial.write("b");  //break out of the loop that was set in the Arduino code
            fetch(`/update?column=${"love"}&value=${++love}`) //update the DB
            .then( res => {
            console.log(res.express); //success message
            window.open('http://localhost:8000', '_self'); //go back to page in same tab
            })
            .catch(e => console.log(e))
        }, 1500);
    }
    
    if (gameover == true){
        noLoop();
        textSize(30);
        text("You lose.",width/2, height/2 - 50); 
        begin = false;
        gameRestart = true;
    }
}

function createBarriers(type, x, y) {
  var a = createSprite(x, y);
  var img = loadImage('games/assets-game3/asteroid'+floor(random(0, 3))+'.png');
  a.addImage(img);
  a.setSpeed(random(2,6)-(type/2), 180);
 
  //a.debug = true;
  a.type = type;

  if(type == 2)
    a.scale = 0.6;
  if(type == 1)
    a.scale = 0.3;

  a.mass = 2+a.scale;
  a.setCollider('circle', 0, 0, 50);

  barriers.add(a);
  return a;
}

function mimiHit(mimi, barrier) {
  mimi.remove();
  barriers.removeSprites();
  barriers.clear();
  gameover = true;
}
