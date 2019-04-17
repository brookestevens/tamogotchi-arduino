/////////////////////////////////////
//
//  Sets up RFID reader for identifying which game to play
//  Upon identifying card, p5 activates games and user enters infinite loop
//  Loop is able to read buttons pressed, and only breaks when game is beaten
//  p5 returns number of lights to be lit for the status bars
//  clear the buffer after every read so it doesnt mess up button readings
//
////////////////////////////////////

#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>

// Choose two pins for SoftwareSerial
SoftwareSerial rSerial(2, 3); // RX, TX

//set up the neopixels
Adafruit_NeoPixel strip = Adafruit_NeoPixel(8, 9, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2 = Adafruit_NeoPixel(8, 10, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip3 = Adafruit_NeoPixel(8, 11, NEO_GRB + NEO_KHZ800);

//BUTTON CONSTANTS
const int buttonPinRight = 7;
const int buttonPinLeft = 4;
const int buttonPinUp = 13;
const int buttonPinDown = 12;
const int buttonPinSelect = 8;

// For SparkFun's tags, we will receive 16 bytes on every
// tag read, but throw four away. The 13th space will always
// be 0, since proper strings in Arduino end with 0

// These constants hold the total tag length (tagLen) and
// the length of the part we want to keep (idLen),
// plus the total number of tags we want to check against (kTags)
const int tagLen = 16;
const int idLen = 13;
const int kTags = 3;

// Put your known tags here!
char knownTags[kTags][idLen] = {
             "2B009F8D0D34",
             "290068F8D069",
             "2B009FE8277B",
};            

// Empty array to hold a freshly scanned tag
char newTag[idLen];

//change the lights based on how "cared for" the tamogotchi is
void lightPixels(int numLights){
  int r,g,b;
  if(numLights <= 2){
    r = 255; g = 0; b = 0; //red---thats bad
  }
  else if(numLights >= 3 && numLights <= 6 ){
    r = 186; g = 209; b = 35; //yellow color
  }
  else{
    r = 0; b = 0; g = 255; //green
  }
  for(int i = 0; i< numLights; i++){
    strip.setPixelColor(i,0,255,0);
    strip.show();
    strip2.setPixelColor(i,0,255,0);
    strip2.show();
    strip3.setPixelColor(i,0,255,0);
    strip3.show();
  }
}

void turnOffPixels(){
  for(int i = 0; i< 8; i++){
    strip.setPixelColor(i,0,0,0);
    strip.show();
    strip2.setPixelColor(i,0,0,0);
    strip2.show();
    strip3.setPixelColor(i,0,0,0);
    strip3.show();
  }
}

// This function steps through both newTag and one of the known
// tags. If there is a mismatch anywhere in the tag, it will return 0,
// but if every character in the tag is the same, it returns 1
int checkTag(char nTag[], char oTag[]) {
    for (int i = 0; i < idLen; i++) {
      if (nTag[i] != oTag[i]) {
        return 0;
      }
    }
  return 1;
}

void setup() {
  // Starts the hardware and software serial ports
  Serial.begin(9600);
  rSerial.begin(9600);
  //Initiate the neopixels
  strip.begin();
  strip.setBrightness(40);
  strip.show();
  //start the buttons
  pinMode(buttonPinLeft, INPUT);
  pinMode(buttonPinRight, INPUT);
  pinMode(buttonPinSelect, INPUT);
}

void loop() {
  //Serial Communication for the buttons: Each button has a unique number that will be sent out
  //up: 1
  //down: 2
  //right: 3
  //left: 4
  //select: 5

  // Counter for the newTag array
  int i = 0;
  // Variable to hold each byte read from the serial buffer
  int readByte;
  // Flag so we know when a tag is over
  boolean tag = false;

  //initialize the neopixels
  //Data to update the neopixels come as 3 digit number in a string ex) '123'
  //100s place is hunger, 10s place is cleanliness, 1s place is happiness
  
  if(Serial.available() > 0){
    String inString = Serial.readStringUntil('\r\n');
    float hungerMeter = floor(inString.toInt()/100); //get the 100s place digit for the hunger meter
    float hygeineMeter = floor(inString.toInt()/10); //get the 10s place digit for the hunger meter
    float happinessMeter = floor(inString.toInt()/100); //get the 1s place digit for the hunger meter
    lightPixels(int(hungerMeter)); //cast as int 
    lightPixels(int(hungerMeter)); //cast as int 
    lightPixels(int(hungerMeter)); //cast as int 
    Serial.flush();
  }

  
  // This makes sure the whole tag is in the serial buffer before
  // reading, the Arduino can read faster than the ID module can deliver!
  if (rSerial.available() == tagLen) tag = true;
  if (tag == true){
    while (rSerial.available()){
      // Take each byte out of the serial buffer, one at a time
      readByte = rSerial.read();
      //This will skip the first byte (2, STX, start of text) and the last three,
      //ASCII 13, CR/carriage return, ASCII 10, LF/linefeed, and ASCII 3, ETX/end of 
      //text, leaving only the unique part of the tag string. It puts the byte into
      //the first space in the array, then steps ahead one spot
      if (readByte != 2 && readByte!= 13 && readByte != 10 && readByte != 3) {
        newTag[i] = readByte;
        i++;
      }
       // If we see ASCII 3, ETX, the tag is over
      if (readByte == 3) {
        tag = false;
      }
    }
  }


  // don't do anything if the newTag array is full of zeroes
  if (strlen(newTag) == 0) return;
  else {
    int total = 0;
    int confirmed;
    for (int ct=0; ct < kTags; ct++){
        total += checkTag(newTag, knownTags[ct]);
    }

    // If newTag matched any of the tags
    // we checked against, total will be 1
    if (total > 0) {
      Serial.println(newTag);
      Serial.flush(); 
        while(1){ //loop forever to record all button inputs for the games
          //int buttonStateLeft = digitalRead(buttonPinLeft);
          //int buttonStateRight = digitalRead(buttonPinRight);
          //int buttonStateSelect = digitalRead(buttonPinSelect);
          if(digitalRead(buttonPinLeft) == HIGH){
            Serial.write(3);
            delay(1);
          }
          if(digitalRead(buttonPinRight) == HIGH){
            Serial.write(4);
            delay(1);
          }
//          if(digitalRead(buttonPinUp) == HIGH){
//            Serial.write(1);
//            delay(1);
//          }
//          if(digitalRead(buttonPinDown) == HIGH){
//            Serial.write(2);
//            delay(1);
//          }
          if(digitalRead(buttonPinSelect) == HIGH){
            Serial.write(5);
            delay(1);
          }
          if(Serial.available() > 0){ //wait for this signal specifically from p5 upon game completion
            char inData = Serial.read();
            if(inData == 'b') break;   
          }
        }
    }
    else{
        // This prints out unknown cards so you can add them to your knownTags as needed
        Serial.print("Unknown tag! ");
        Serial.print(newTag);
        Serial.println();
    }
  }

  // Once newTag has been checked, fill it with zeroes
  // to get ready for the next tag read
  for (int c=0; c < idLen; c++) {
    newTag[c] = 0;
  }

}




