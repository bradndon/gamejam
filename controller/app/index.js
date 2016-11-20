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
    console.log(data)
    if (device_id == AirConsole.SCREEN && data.action == "MOVE_DONE") {
      document.getElementById("moveButtonsView").style.display = "block";
      if (data.station.items.items != undefined)
        document.getElementById("workstation").innerHTML = data.station_items.items
    } else if (data.action == "INVENTORY_UPDATE") {
      // document.getElementById("inventory1").innerHTML = data.item
      document.getElementById("inventoryitemimage").src = data.item + ".png"
      document.getElementById("inventory2").innerHTML = data.color
      document.getElementById("inventory2").style.background = data.color
    }
  }
};
window.onload = function() {
  init();
  document.getElementById("button0").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 0})
  });
  document.getElementById("button1").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 1})
  });
  document.getElementById("button2").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 2})
  });
  document.getElementById("button3").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 3})
  });
  document.getElementById("inventory1").addEventListener("click", function() {
    document.getElementById("inventoryitemimage").src = ""
    airconsole.message(AirConsole.SCREEN, {action: "USE_ITEM", item: "item"})

  });
  document.getElementById("inventory2").addEventListener("click", function() {
    airconsole.message(AirConsole.SCREEN, {action: "USE_ITEM", item: "color"})
  });
};
