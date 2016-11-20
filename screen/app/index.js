window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

window.onload = function() {
      var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
      var ITEMS = {"horse": ["horsebody", "horselegs", "horsehead"], "bear": ["bearbody", "bearhead"], "man": ["manbody", "manlegs", "manhead"]}
      var ITEM_NAMES = ["horse", "bear", "man"]
      var COLORS = {"red": "#ff0000", "green": "#00ff00", "blue": "#0000bb"}
      var COLOR_NAMES = ["red", "green", "blue"]
      var Elf = function(device_id) {
        this.device_id = device_id
        this.station = 0
        this.prevStation = 0
        this.elf = game.add.sprite(game.world.randomX, game.world.randomY, 'elf');
        this.elf.anchor.setTo(0.5, 0.5);
        this.goalX = this.elf.x
        this.goalY = this.elf.y
        game.physics.enable(this.elf, Phaser.Physics.ARCADE);
        this.traveling = false;
        var item = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)]
        var color = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]
        this.inventory = {item: ITEMS[item][Math.floor(Math.random() * ITEMS[item].length)], color: COLORS[color]}
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        airconsole.message(this.device_id, message)
      }
      Elf.prototype.getNewItem = function() {
        var item = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)]
        this.inventory.item = ITEMS[item][Math.floor(Math.random() * ITEMS[item].length)]
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        airconsole.message(this.device_id, message)
      }

      Elf.prototype.getNewColor = function() {
        var color = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]
        this.inventory.color = COLORS[color]
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        airconsole.message(this.device_id, message)
      }

      Elf.prototype.gotoStation = function(station) {
        console.log(station)
        this.goalX = stations[station].x;
        this.goalY = stations[station].y;
        this.prevStation = this.station
        this.station = station
        this.traveling = true
      }

      Elf.prototype.update = function() {
        if (this.goalX - 5 < this.elf.x && this.goalX + 5 > this.elf.x) {
          this.elf.body.velocity.x = 0;
          this.elf.x = this.goalX
        }  else if (this.goalX < this.elf.x) {
          this.elf.body.velocity.x = -150;
        } else if (this.goalX > this.elf.x) {
          this.elf.body.velocity.x = 150;
        }
        if (this.goalY - 5 < this.elf.y && this.goalY + 5 > this.elf.y) {
          this.elf.body.velocity.y = 0;
          this.elf.y = this.goalY
        } else if (this.goalY < this.elf.y) {
          this.elf.body.velocity.y = -150;
        } else if (this.goalY > this.elf.y) {
          this.elf.body.velocity.y = 150;
        }

        if (this.elf.x === this.goalX && this.elf.y === this.goalY && this.traveling) {
          for (elf in elves) {
            console.log("HERE")
            console.log(this.elf.x)
            console.log(elves[elf].elf.x)
            if (elves[elf] != this && this.elf.x === elves[elf].elf.x && this.elf.y === elves[elf].elf.y) {
              this.gotoStation(this.prevStation)
              return
            }
          }
          airconsole.message(this.device_id, {action: "MOVE_DONE", station_items: stations[this.station].items})
          this.traveling = false;
        }
      }

      var Station = function(x, y) {
        this.station = game.add.sprite(x,y,'station');
        this.station.scale.setTo(2,2)
        this.station.anchor.setTo(0.5,0.5)
        this.items = {}
        this.x = x
        this.y = y
      }

      Station.prototype.addItem = function(item) {
        if (this.items.items === undefined) {
          this.items.items = [item]
        } else {
          this.items.items.push(item)
        }

      }

      Station.prototype.addColor = function(color) {
        if (this.items.color === undefined && this.items.items !== undefined) {
          this.items.color = color
          return true
        }
        return false
      }

      function preload () {

        game.load.image('elf', require('./assets/elf.png'));
        game.load.image('station', require('./assets/station.png'));
        game.load.image('background', require('./assets/Background.png'))
      }
      var stations;
      var elves;
      function create () {
        game.add.sprite(0,0, 'background')
          elves = {}

          stations = []
          stations.push(new Station(150,300))
          stations[0].items = {items: ["horselegs"], color: ""}
          stations.push(new Station(150,500))
          stations.push(new Station(500,500))
          stations.push(new Station(500,300))

          //
          // elves[1] = new Elf(1)
          // elves[2] = new Elf(2);
          // elves[1].gotoStation(1)
          // elves[2].gotoStation(1)
          // console.log(elves[2].inventory)
          // stations[elves[2].station].addItem(elves[2].inventory.item)
          // console.log(stations[elves[2].station].addColor(elves[2].inventory.color))
          // console.log(elves[2].inventory)
          // console.log(stations[elves[2].station].addColor(elves[2].inventory.color))

          airconsole = new AirConsole();
              airconsole.onReady = function() {

              };
                airconsole.onConnect = function(device_id) {
                  console.log(device_id)
                  elves[device_id] = new Elf(device_id)
                };
              airconsole.onMessage = function(device_id, data) {
                console.log(data)
                console.log(device_id)
                var elf = elves[device_id]
                if (elf != null && data.action == "MOVE_STATION") {
                  elf.gotoStation(data.station)
                } else if (elves[device_id] != null && data.action == "USE_ITEM") {
                  if (data.item == "item") {
                    stations[elf.station].addItem(elf.inventory.item)
                    elf.getNewItem()
                    console.log("STATION_UPDATE")
                    airconsole.message(elf.device_id, {action: "STATION_UPDATE", station_items: stations[this.station].items})
                  } else {
                    if (stations[elf.station].addColor(elf.inventory.color)) {
                      elf.getNewColor()
                      airconsole.message(elf.device_id, {action: "STATION_UPDATE", station_items: stations[this.station].items})
                    } else {
                      console.log("NOPE")
                    }
                  }
                }
              }

      }
      function update() {
        for (elf in elves) {
          elves[elf].update();
        }
      }


  };
