window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

var airconsole;
/**
 * Sets up the communication to the screen.
 */
function init() {
  airconsole = new AirConsole({"orientation": "portrait"});
  /*
   * Checks if this device is part of the active game.
   */
  airconsole.onActivePlayersChange = function(player) {
    var div = document.getElementById("player_id");
    if (player !== undefined) {
      div.innerHTML =  (["Left Player", "Right Player"][player]);
    } else {
      div.innerHTML = "It's a 2 player game!";
    }
  };
  airconsole.onMessage = function(device_id, data) {
    if (device_id == AirConsole.SCREEN) {
      document.getElementById("moveButtonsView").style.display = "block";
    }
  }
};
window.onload = function() {
  init();
  document.getElementById("button0").addEventListener("click", function() {
    airconsole.message(AirConsole.SCREEN, {station: 0})
    document.getElementById("moveButtonsView").style.display = "none";
  });
  document.getElementById("button1").addEventListener("click", function() {
    airconsole.message(AirConsole.SCREEN, {station: 1})
    document.getElementById("moveButtonsView").style.display = "none";
  });
  document.getElementById("button2").addEventListener("click", function() {
    airconsole.message(AirConsole.SCREEN, {station: 2})
    document.getElementById("moveButtonsView").style.display = "none";
  });
  document.getElementById("button3").addEventListener("click", function() {
    airconsole.message(AirConsole.SCREEN, {station: 3})
    document.getElementById("moveButtonsView").style.display = "none";
  });
};
