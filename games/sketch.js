//////////////////////////////////////
//
//  Breakout game for feeding the tamogotchi
//  updates the DB upon completion of game  
//  redirects back to the home page
//
//////////////////////////////////////

  var paddle, ball, wallTop, wallBottom, wallLeft, wallRight, bricks;
  var MAX_SPEED = 9;
  var WALL_THICKNESS = 30;
  var BRICK_W = 40;
  var BRICK_H = 20;
  var BRICK_MARGIN = 4;
  var ROWS = 1;
  var COLUMNS = 10;
  var gameOver;
  var score = 0;
  var hunger = 0; //stores the initial DB call
  var flag = true;
  var begin = false;
  var gameRestart = false ; //these flags are necessary so the program doesnt loop too many times

  //For the serial Port
  var serial; //variable to hold an instance of the serial port library
  var portName = '/dev/cu.usbmodem14201'; //fill in with YOUR port
  var inData;

  function preload(){
    fetch('/display')
    .then(res => res.json())
    .then(function(res) {
        hunger = res.info.food;
    })
    .catch(res => console.log(res))
  }

  //parse the data
  function serialEvent(){
    inData = +serial.read(); //convert to a number
    //console.log(inData);
    if(inData === 5 && begin == false){ //start game after half a second
      begin = true;
      if(gameRestart === true){ //restart the game if failed
        location.reload();
      } //page refresh;
      else{ //begin the game 
        setTimeout(function(){
          if(ball.velocity.x == 0 && ball.velocity.y == 0) ball.setSpeed(MAX_SPEED, random(90-10, 90+10));
        }, 1000); 
      }  
    }
    if( inData === 3){ //LEFT BUTTON
      if (paddle.position.x >= 70){
        paddle.position.x -= 1;
      }
    }
    if( inData === 4){ //RIGHT BUTTON
      if (paddle.position.x <= 430){
        paddle.position.x += 1;
      }
    }

  }

  function setup() {
    //Serial communication 
    serial = new p5.SerialPort(); //a new instance of serial port library

    //set up events for serial communication / debuggging information
    serial.on('connected', () => console.log("Connected to the server"));
    serial.on('open', () => console.log("The serial port opened!"));
    serial.on('error', (err) => console.log("something went wrong with the port " + err));
    serial.on('close', () => console.log("The port closed"));
    serial.on('data', serialEvent);
  
    //open our serial port
    serial.open(portName);

    //setup for the game

    createCanvas(500, 500);

    paddle = createSprite(width/2, height-50, 100, 10);
    paddle.immovable = true;

    wallTop = createSprite(width/2, -WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
    wallTop.immovable = true;

    wallBottom = createSprite(width/2, height+WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
    wallBottom.immovable = true;

    wallLeft = createSprite(-WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
    wallLeft.immovable = true;

    wallRight = createSprite(width+WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
    wallRight.immovable = true;

    bricks = new Group();

    var offsetX = width/2-(COLUMNS-1)*(BRICK_MARGIN+BRICK_W)/2;
    var offsetY = 80;

    for(var r = 0; r<ROWS; r++)
      for(var c = 0; c<COLUMNS; c++) {
        var brick = createSprite(offsetX+c*(BRICK_W+BRICK_MARGIN), offsetY+r*(BRICK_H+BRICK_MARGIN), BRICK_W, BRICK_H);
        brick.shapeColor = color(255, 255, 255);
        bricks.add(brick);
        brick.immovable = true;
      }

    //the easiest way to avoid pesky multiple collision is to
    //have the ball bigger than the bricks
    ball = createSprite(width/2, height-200, 11, 11);
    ball.maxSpeed = MAX_SPEED;
    paddle.shapeColor = ball.shapeColor = color(255, 255, 255);

  }

  function draw() {
    background(131, 134, 247);
    textSize(20);
    text('Score: ' + score, 50, 50);
    text('Press Select to start Game', 200, 50);
    //paddle.position.x = constrain(LEFT_ARROW, paddle.width/2, width-paddle.width/2);


    ball.bounce(wallTop);
    ball.bounce(wallBottom);
    ball.bounce(wallLeft);
    ball.bounce(wallRight);

    if(ball.bounce(paddle))
    {
      var swing = (ball.position.x-paddle.position.x)/3;
      ball.setSpeed(MAX_SPEED, ball.getDirection()+swing);
    }

    ball.bounce(bricks, brickHit);

    drawSprites();

    if(ball.position.y >= 490){
     gameOver();
   }
   //make sure this only makes 1 QUERY!!!! NO LOOPING -- will be true upon page reload/redirect
   if(score >= 7){
     if(flag == true) gameWin();
     flag = false;
  }


  }
  function gameOver(){
    ball.setSpeed(0); 
    textSize(30);
    textAlign(CENTER);
    text('Gameover', 250, 250);
    text("Try again? Press select to retry. ", 250, 300);
    gameRestart = true;
    begin = false;
  }

  function gameWin() {
    ball.setSpeed(0); 
    //delay this message for a second...flag stops it from looping > 1
    setTimeout(function(){
      textSize(30);
      textAlign(CENTER);
      text('You have fed the tamogotchi', 250, 250);
      serial.write("b");  //break out of the loop that was set in the Arduino code
      fetch(`/update?column=${"food"}&value=${++hunger}`) //update the DB
      .then( res => {
        console.log(res.express); //success message
        window.open('http://localhost:8000', '_self'); //go back to page in same tab
      })
      .catch(e => console.log(e))
    }, 1500);
  }


  function brickHit(ball, brick) {
    brick.remove();
    score++;
  }

