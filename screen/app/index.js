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
        console.log(message)
        airconsole.message(this.device_id, message)
      }
      Elf.prototype.getNewItem = function() {
        var item = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)]
        this.inventory.item = ITEMS[item][Math.floor(Math.random() * ITEMS[item].length)]
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        console.log(message)
        airconsole.message(this.device_id, message)
      }

      Elf.prototype.getNewColor = function() {
        var color = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]
        this.inventory.color = COLORS[color]
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        console.log(message)
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
            if (elf != this && this.elf.x === elf.x && this.elf.y === elf.y) {
              this.gotoStation(prevStation)
              return
            }
          }
          airconsole.message(this.device_id, {action: "MOVE_DONE"})
          this.traveling = false;
        }
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
          stations.push(game.add.sprite(150, 300, 'station'))
          stations[0].scale.setTo(2,2)
          stations[0].anchor.setTo(0.5,0.5)
          stations.push(game.add.sprite(150,500, 'station'))
          stations[1].anchor.setTo(0.5,0.5)
          stations[1].scale.setTo(2,2)
          stations.push(game.add.sprite(500,500, 'station'))
          stations[2].anchor.setTo(0.5,0.5)
          stations[2].scale.setTo(2,2)
          stations.push(game.add.sprite(500,300, 'station'))
          stations[3].anchor.setTo(0.5,0.5)
          stations[3].scale.setTo(2,2)

          airconsole = new AirConsole();
              airconsole.onReady = function() { };
                airconsole.onConnect = function(device_id) {
                  elves[device_id] = new Elf(device_id)
                };
              airconsole.onMessage = function(device_id, data) {
                console.log(data)
                if (elves[device_id] != null && data.action == "MOVE_STATION") {
                  elves[device_id].gotoStation(data.station)
                } else if (elves[device_id] != null && data.action == "USE_ITEM") {
                  if (data.item == "item") {
                    elves[device_id].getNewItem()
                  } else {
                    elves[device_id].getNewColor()
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
