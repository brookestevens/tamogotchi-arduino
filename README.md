# tamogotchi-arduino
Final project for ATLS 3300 - OBJECT
-----------------

Purpose: Create a tamogotchi web app that can interact with users through minigames to take care of it. Users interact via Arduino controller and plushies that have RFID tags that can be scanned
<br/>
<h2>Software</h2>
<ul>
  <li> Arduino UNO </li>
  <li> Node.js with Express </li>
  <li> PostgreSQL with pg-promise  </li>
  <li> P5.js  </li>
  <li> P5.serialport and P5.game libraries </li>
</ul>
<h2>Interaction</h2>
<ul>
  <li> Arduino game controller </li>
  <li> Sparkfun RFID USB reader </li>
  <li> Games and animations written with p5  </li>
</ul>
<h2> Details </h2>
<p>
We are creating a tamogotchi app that users can take care of on a web app. We are using Postgres becasue we want to be able to save the tamogotchi's status (food, hygiene, happiness) so the user can close and open the app and data wont reset. We have some neopixel strips tho replicate a status bar for each of the respective stats. We also made a simple game controller with a few buttons to play the games with. 
</br>
</br>
Each game loads in the current window and when the game is completed, the user is redirected to the home page again. This makes loading each game and updating the database much easier. For the arduino, basically once the RFID card is scanned, it activates an infinite loop. The loop is only broken once the user completes the game. The loop is able to send data about the buttons pressed while the user plays the game. The RFID card also is used to choose a certain game. 
</p>
