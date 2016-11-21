var AirConsole = require('airconsole/airconsole-1.6.0')

var airconsole;
var stationitems
/**
 * Sets up the communication to the screen.
 */
function init() {
  airconsole = new AirConsole({"orientation": "portrait"});
  /*
   * Checks if this device is part of the active game.
   */
  airconsole.onActivePlayersChange = function(player) {

  };
  airconsole.onMessage = function(device_id, data) {
    console.log(data)
    if (device_id == AirConsole.SCREEN && data.action == "MOVE_DONE") {
      document.getElementById("moveButtonsView").style.display = "block";
      stationitems = data.station_items
      if (data.station_items.items != undefined) {
        for (item in data.station_items.items.reverse()) {
          data.station_items.items[item]
          var elem = document.createElement("img");
          elem.setAttribute("alt", "Flower");
          elem.src = data.station_items.items[item] + ".png"
          document.getElementById("workstationinner").appendChild(elem);
        }
      }
      if (data.station_items.color != undefined) {
        // document.getElementById("workstation").innerHTML += data.station_items.color
      }
    } else if (data.action == "STATION_UPDATE") {
      stationitems = data.station_items
      document.getElementById("workstationinner").innerHTML = "";

      if (data.station_items.items != undefined) {
        for (item in data.station_items.items.reverse()) {
          data.station_items.items[item]
          var elem = document.createElement("img");
          elem.setAttribute("alt", "Flower");
          elem.src = data.station_items.items[item] + ".png"
          document.getElementById("workstationinner").appendChild(elem);
        }
      }
      if (data.station_items.color != undefined) {
        // document.getElementById("workstation").innerHTML += data.station_items.color
      }
    } else if (data.action == "INVENTORY_UPDATE") {
      // document.getElementById("inventory1").innerHTML = data.item
      document.getElementById("inventoryitemimage").src = data.item + ".png"
      document.getElementById("inventory2").innerHTML = data.color
      // document.getElementById("inventory2").style.background = data.color
    } else if (data.action == "SET_COLOR") {
      document.getElementById("topbar").style.background = data.color
    }
  }
};
window.onload = function() {
	img1 = new Image();
	img2 = new Image();
	img3 = new Image();
  img4 = new Image();
  img5 = new Image();
  img6 = new Image();
  img7 = new Image();
  img8 = new Image();

	img1.src = "./bearbody.png";
	img2.src = "./bearhead.png";
	img3.src = "./horsebody.png";
  img4.src = "./horsehead.png";
	img5.src = "./horselegs.png";
	img6.src = "./manbody.png";
  img7.src = "./manhead.png";
	img8.src = "./manlegs.png";
  init();
  document.getElementById("button0").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    document.getElementById("workstationinner").innerHTML = "";

    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 0})
  });
  document.getElementById("button1").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    document.getElementById("workstationinner").innerHTML = "";

    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 1})
  });
  document.getElementById("button2").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    document.getElementById("workstationinner").innerHTML = "";

    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 2})
  });
  document.getElementById("button3").addEventListener("click", function() {
    document.getElementById("moveButtonsView").style.display = "none";
    document.getElementById("workstationinner").innerHTML = "";

    airconsole.message(AirConsole.SCREEN, {action: "MOVE_STATION", station: 3})
  });
  document.getElementById("inventory1").addEventListener("click", function() {
    if (stationitems.length < 3) {
      console.log("inven1")
      airconsole.message(AirConsole.SCREEN, {action: "USE_ITEM", item: "item"})
    }

  });
  document.getElementById("inventory2").addEventListener("click", function() {
    console.log("inven2")

    airconsole.message(AirConsole.SCREEN, {action: "USE_ITEM", item: "color"})
  });
};
