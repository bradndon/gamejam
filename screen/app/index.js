window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

window.onload = function() {
      console.log("version 0.0.0.0.0.0.7")
      var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
      var ITEMS = {"horse": ["horsebody", "horselegs", "horsehead"], "bear": ["bearbody", "bearhead"], "man": ["manbody", "manlegs", "manhead"]}
      var ITEM_NAMES = ["horse", "bear", "man"]
      var COLORS = {"red": "#ff0000", "green": "#00ff00", "blue": "#0000bb"}
      var COLOR_NAMES = ["red", "green", "blue"]
      var Elf = function(device_id, color) {
        this.device_id = device_id
        this.station = 3
        this.prevStation = 3
        this.elf = game.add.sprite(game.world.randomX, game.world.randomY, color + 'elf');
        this.elf.anchor.setTo(0.5, 0.5);
        this.elf.animations.add('walk', [0,1], 10, true)

        this.goalX = this.elf.x
        this.goalY = this.elf.y
        game.physics.enable(this.elf, Phaser.Physics.ARCADE);
        this.traveling = false;
        var item = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)]
        var color = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]
        this.inventory = {item: ITEMS[item][Math.floor(Math.random() * ITEMS[item].length)], color: COLORS[color]}
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        // airconsole.message(this.device_id, message)
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
        this.elf.animations.play('walk');
      }

      Elf.prototype.update = function() {
        if (this.goalX - 5 < this.elf.x && this.goalX + 5 > this.elf.x) {
          this.elf.body.velocity.x = 0;
          this.elf.x = this.goalX
          this.elf.scale.x = 1
        }  else if (this.goalX < this.elf.x) {
          this.elf.body.velocity.x = -150;
          this.elf.scale.x = 1
        } else if (this.goalX > this.elf.x) {
          this.elf.body.velocity.x = 150;
          this.elf.scale.x = -1
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
            if (elves[elf] != this && this.elf.x === elves[elf].elf.x && this.elf.y === elves[elf].elf.y) {
              this.gotoStation(this.prevStation)
              return
            }
          }

          airconsole.message(this.device_id, {action: "MOVE_DONE", station_items: stations[this.station].items})
          this.elf.animations.stop()
          this.elf.frame = 0
          this.traveling = false;
        }
      }

      var Station = function(x, y) {
        this.station = game.add.sprite(x,y,'station');
        this.station.scale.setTo(1,1)
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

        // game.load.image('elf', require('./assets/redelf.png'));
        game.load.spritesheet('redelf', require('./assets/redelf.png'), 128, 128)
        game.load.spritesheet('greenelf', require('./assets/greenelf.png'), 128, 128)
        game.load.spritesheet('blueelf', require('./assets/blueelf.png'), 128, 128)
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

          elves[1] = new Elf(1, "red")
          elves[2] = new Elf(2, "green");
          elves[1].gotoStation(1)
          elves[2].gotoStation(1)
          // console.log(elves[2].inventory)
          // stations[elves[2].station].addItem(elves[2].inventory.item)
          // console.log(stations[elves[2].station].addColor(elves[2].inventory.color))
          // console.log(elves[2].inventory)
          // console.log(stations[elves[2].station].addColor(elves[2].inventory.color))

          airconsole = new AirConsole();
              airconsole.onReady = function() {
              };
                airconsole.onConnect = function(device_id) {
                  airconsole.setActivePlayers(3)

                  var colors = ["red", "green", "blue"]
                  elves[device_id] = new Elf(device_id, colors[airconsole.convertDeviceIdToPlayerNumber(device_id)])
                  console.log(airconsole.convertPlayerNumberToDeviceId(0))
                  console.log(airconsole.convertDeviceIdToPlayerNumber(device_id))
                  airconsole.message(airconsole.convertPlayerNumberToDeviceId(0), {action: "SET_COLOR", color:"#ff0000"})
                  airconsole.message(airconsole.convertPlayerNumberToDeviceId(1), {action: "SET_COLOR", color:"#00ff00"})
                  airconsole.message(airconsole.convertPlayerNumberToDeviceId(2), {action: "SET_COLOR", color:"#0000ff"})
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
                    airconsole.message(elf.device_id, {action: "STATION_UPDATE", station_items: stations[elf.station].items})
                  } else {
                    if (stations[elf.station].addColor(elf.inventory.color)) {
                      elf.getNewColor()
                      airconsole.message(elf.device_id, {action: "STATION_UPDATE", station_items: stations[elf.station].items})
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
