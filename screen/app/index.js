window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

window.onload = function() {
      console.log("version 0.0.0.0.0.3.9")
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
        this.elf.animations.add('work', [2,3], 10, true)
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
        this.goalX = stations[station].x + 80;
        this.goalY = stations[station].y - 20;
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
          console.log( {action: "MOVE_DONE", station_items: stations[this.station].items})
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
        this.itemsprites = []
        this.complete = false
        this.type = undefined
        this.x = x
        this.y = y
      }

      Station.prototype.addItem = function(item) {
        if (this.items.items === undefined) {
          this.items.items = [item]
        } else {
          var items = this.items.items
          items.push(item)
          var head = false;
          var body = false;
          var legs = false;
          if (items.length >=2) {
            for (var i = 0; i < items.length; i++) {
              if ( !head && items[i].indexOf("head") !== -1 ) {
                  console.log("head")
                  head = true;
                  if (this.type === undefined) {
                    this.type = items[i].split("head")[0]
                  } else if (this.type != items[i].split("head")[0]) {
                    this.drawItems()
                    return;
                  }
                } else if (!body && items[i].indexOf("body") !== -1) {
                  body = true;
                  console.log(items[i].split("body")[0])
                  if (this.type === undefined) {
                    this.type = items[i].split("body")[0]
                  } else if (this.type != items[i].split("body")[0]) {
                    this.drawItems()
                    return;
                  }
                } else if (!legs && items[i].indexOf("legs") !== -1) {
                  legs = true;
                  console.log(items[i].split("legs")[0])
                  if (this.type === undefined) {
                    this.type = items[i].split("legs")[0]
                  } else if (this.type != items[i].split("legs")[0]) {
                    this.drawItems()
                    return;
                  }
                } else {
                  this.drawItems()
                  return;
              }
            }
          }
          if (items.length == 2 && head && body && this.type === "bear") {
            this.complete = true;
          } else if (items.length === 3 && head && body && legs) {
            this.complete = true;
          }
        }
        this.drawItems()
      }

      Station.prototype.drawItems = function() {
        for (var i = 0; i < this.itemsprites.length; i++) {
          this.itemsprites[i].destroy()
        }
        if (!this.complete) {
          var height = 20;
          for (var i = 0; i < this.items.items.length; i++) {

            var newItem = game.add.sprite(this.x, this.y - height, this.items.items[i])
            newItem.anchor.setTo(0.5,0.5)
            newItem.scale.setTo(0.5,0.5)
            height += newItem.height
            console.log(height)
            this.itemsprites.push(newItem)
          }
        } else {
          var newItem = game.add.sprite(this.x, this.y - 20, this.type)
          newItem.anchor.setTo(0.5,0.75)
          this.itemsprites.push(newItem)
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

        game.load.spritesheet('redelf', require('./assets/redelf.png'), 128, 128)
        game.load.spritesheet('greenelf', require('./assets/greenelf.png'), 128, 128)
        game.load.spritesheet('blueelf', require('./assets/blueelf.png'), 128, 128)
        game.load.image('horsehead', require('../../horsehead.png'))
        game.load.image('horsebody', require('../../horsebody.png'))
        game.load.image('horselegs', require('../../horselegs.png'))
        game.load.image('manhead', require('../../manhead.png'))
        game.load.image('manbody', require('../../manbody.png'))
        game.load.image('manlegs', require('../../manlegs.png'))
        game.load.image('bearhead', require('../../bearhead.png'))
        game.load.image('bearbody', require('../../bearbody.png'))
        game.load.image('station', require('./assets/station.png'));
        game.load.image('man', require('../../man.png'))
        game.load.image('bear', require('../../bear.png'))
        game.load.image('horse', require('../../horse.png'))
        game.load.image('background', require('./assets/Background.png'))
      }
      var stations;
      var elves;
      function create () {
        game.stage.smoothed = false
        game.add.sprite(0,0, 'background')
          elves = {}

          stations = []
          stations.push(new Station(150,300))
          // stations[0].items = {items: ["horselegs", "horsebody"], color: ""}
          // stations[0].addItem("horsehead")
          // stations[0].drawItems();
          stations.push(new Station(150,500))
          // stations[1].items = {items: ["manlegs", "manbody"], color: ""}
          // stations[1].addItem("manhead")
          // stations[1].drawItems();
          stations.push(new Station(500,500))
          // stations[2].items = {items: ["bearbody"], color: ""}
          // stations[2].addItem("bearhead")
          // stations[2].drawItems();
          stations.push(new Station(500,300))

          // elves[1] = new Elf(1, "red")
          // elves[2] = new Elf(2, "green");
          // elves[1].gotoStation(1)
          // elves[2].gotoStation(1)
          // stations[  elves[2].station].addItem(  elves[2].inventory.item)
          //   elves[2].getNewItem()
          // for (item in stations[  elves[2].station].items.items) {
          //   console.log(item)
          //   if (stations[  elves[2].station].items.items[item].indexOf("head") !== -1) {
          //     console.log("head")
          //   } else if (stations[  elves[2].station].items.items[item].indexOf("body") !== -1) {
          //     console.log("body")
          //   } else {
          //     console.log("legs")
          //   }
          // }
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
                airconsole.onDisconnect = function(device_id) {
                  elves[device_id].elf.destroy()
                  elves[device_id] = null
                }
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
                    for (item in stations[elf.station].items) {
                      console.log(item)
                      if (item.indexOf("head") !== -1) {
                        console.log("head")
                      } else if (item.indexOf("body") !== -1) {
                        console.log("body")
                      } else {
                        console.log("legs")
                      }
                    }
                    console.log({action: "STATION_UPDATE", station_items: stations[elf.station].items.items})
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
