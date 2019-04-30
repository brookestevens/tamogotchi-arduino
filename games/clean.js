////////////////////////////////////////////
//
//  game taken from p5 game library examples
//  modified to keep score, win/lose, work with p5 serial port and DB
//  Cleaning tamogotchi
//
////////////////////////////////////////////


var bullets, asteroids, ship, shipImage, bulletImage, particleImage;
var MARGIN = 40;
var score = 0;
var hygiene = 0;
var begin = false;
var gameRestart = false;

//handle serialEvent 
function serialEvent(){
  inData = +serial.read();
  if(inData === 1 && begin == false){ //start game after half a second
    if(gameRestart === true){ //restart the game if failed by page refresh
      location.reload();
    }
    else{ //begin the game 
      setTimeout(function(){
        begin = true;
      }, 1000); 
    }  
  }
  if( inData === 2){ //LEFT BUTTON
    ship.rotation -= .5;
  }
  if( inData === 5){ //RIGHT BUTTON
    ship.rotation += .5;
  }
  if( inData === 4){ //UP BUTTON
    var bullet = createSprite(ship.position.x, ship.position.y);
    bullet.addImage(bulletImage);
    bullet.setSpeed(10+ship.getSpeed(), ship.rotation);
    bullet.life = 30;
    bullets.add(bullet);
  }

}


//set ip the DB
function preload(){
  fetch('/display',{
    headers: {"Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(function(res) {
      hygiene = res.info.hygiene;
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

  bulletImage = loadImage('games/assets-game2/asteroids_bullet.png');
  shipImage = loadImage('games/assets-game2/asteroids_ship0001.png');
  particleImage = loadImage('games/assets-game2/asteroids_particle.png');

  ship = createSprite(width/2, height/2);
  ship.maxSpeed = 6;
  ship.friction = 0.98;
  ship.setCollider('circle', 0, 0, 20);

  ship.addImage('normal', shipImage);
  ship.addAnimation('thrust', 'games/assets-game2/asteroids_ship0002.png', 'games/assets-game2/asteroids_ship0007.png');

  asteroids = new Group();
  bullets = new Group();

  for(var i = 0; i < 3; i++) {
    var ang = random(360);
    var px = width/2 + 1000 * cos(radians(ang));
    var py = height/2+ 1000 * sin(radians(ang));
    createAsteroid(3, px, py);
  }
}

function draw() {
  background(0);
  fill('#BAE1FF');
  textAlign(CENTER);
  text('Controls: Left + Right, Up to shoot', width/2, 20);
  text("Score: " + score, width/2, 40);

  if(begin === true){
    for(var i=0; i<allSprites.length; i++) {
      var s = allSprites[i];
      if(s.position.x<-MARGIN) s.position.x = width+MARGIN;
      if(s.position.x>width+MARGIN) s.position.x = -MARGIN;
      if(s.position.y<-MARGIN) s.position.y = height+MARGIN;
      if(s.position.y>height+MARGIN) s.position.y = -MARGIN;
    }
  }

  drawSprites();

  asteroids.overlap(bullets, asteroidHit);

  //collision between ship and asteroid occurs, game over
  //noLoop breaks the draw() loop
  if(ship.overlap(asteroids, ship) === true){
    ship.remove();
    noLoop();
    gameOver();
    begin = false;
    gameRestart = true;
  }

  ship.bounce(asteroids);
   
  if(score >= 45){
    ship.remove();
    noLoop();
    gameWin();
  }

}

function gameOver(){
  fill('#BAE1FF');
  textSize(30);
  text('GAME OVER', width/2, 200);
  text('Press black button to retry', width/2, 250);
  gameRestart = true;
}

function gameWin(){
  setTimeout(function(){
    fill('#BAE1FF');
    textSize(30);
    textAlign(CENTER);
    text('You have cleaned the tamogotchi!', 250, 250);
    serial.write("b");  //break out of the loop that was set in the Arduino code
    fetch(`/update?column=${"hygiene"}&value=${++hygiene}`) //update the DB
    .then( res => {
      console.log(res.express); //success message
      window.open('http://localhost:8000', '_self'); //go back to page in same tab
    })
    .catch(e => console.log(e))
  }, 1500);
}

function keyPressed(){ 
  if (keyCode === RIGHT_ARROW) ship.rotation += 50;
  if (keyCode === LEFT_ARROW) ship.rotation -= 50;
  if (keyCode === UP_ARROW){
    var bullet = createSprite(ship.position.x, ship.position.y);
    bullet.addImage(bulletImage);
    bullet.setSpeed(10+ship.getSpeed(), ship.rotation);
    bullet.life = 30;
    bullets.add(bullet);
  }
}

function createAsteroid(type, x, y) {
  var a = createSprite(x, y);
  var img = loadImage('games/assets-game2/asteroid'+floor(random(0, 3))+'.png');
  a.addImage(img);
  a.setSpeed(3.5-(type/2), random(360));
  a.rotationSpeed = 0.5;
  //a.debug = true;
  a.type = type;

  if(type == 2) a.scale = 0.6;
  if(type == 1) a.scale = 0.3;

  a.mass = 2+a.scale;
  a.setCollider('circle', 0, 0, 50);
  asteroids.add(a);
  return a;
}

function asteroidHit(asteroid, bullet) {
  score++;
  var newType = asteroid.type-1;

  if(newType>0) {
    createAsteroid(newType, asteroid.position.x, asteroid.position.y);
    createAsteroid(newType, asteroid.position.x, asteroid.position.y);
  }

  for(var i=0; i<8; i++) {
    var p = createSprite(bullet.position.x, bullet.position.y);
    p.addImage(particleImage);
    p.setSpeed(random(3, 5), random(360));
    p.friction = 0.95;
    p.life = 15;
  }

  bullet.remove();
  asteroid.remove();
}
setTimeout(function(){ 
for(var i = 0; i < 5; i++) {
  var ang = random(360);
  var px = width/2 + 1000 * cos(radians(ang));
  var py = height/2+ 1000 * sin(radians(ang));
  createAsteroid(3, px, py);
}
}, 5000);

setTimeout(function(){
  bullets.remove();
}, 1500);


