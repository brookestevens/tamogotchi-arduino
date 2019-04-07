/////////////////////////////////////
//
//  testing serial communication
//  when the user presses a button, signal is sent to p5
//  p5 returns a random number of lights to be lit up
//  yes serial comm is VERY unneccesary, but im testing...
//
////////////////////////////////////


#include <Adafruit_NeoPixel.h>

#define PIN 2
#define LED_PIN 9

Adafruit_NeoPixel strip = Adafruit_NeoPixel(60, 9, NEO_GRB + NEO_KHZ800);

int state, buttonPressed;

void lightNeoPixel(int numLights){
  for(int i = 0; i < numLights; i++){
    strip.setPixelColor(i, 139,24,206);
    strip.show();
  }
}

void clearLights(){
    for(int i = 0; i < 60; i++){
    strip.setPixelColor(i,0,0,0);
    strip.show();
  }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(2, INPUT);
  strip.begin();
  strip.setBrightness(50);
  strip.show();
  delay(300);
}

void loop() {
  // Sending all of the data out
  state = digitalRead(2);
  if(state == HIGH){
    Serial.write(true);
    delay(1);
  }
  //recieveing all the data
  if(Serial.available() > 0){
      buttonPressed = Serial.read();
      clearLights();
      lightNeoPixel(buttonPressed);
  }
}
