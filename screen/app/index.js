window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

window.onload = function() {
      console.log("version 0.0.0.0.5.0.10")
      var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
      var ITEMS = {"horse": ["horsebody", "horselegs", "horsehead"], "bear": ["bearbody", "bearhead"], "man": ["manbody", "manlegs", "manhead"]}
      var ITEM_NAMES = ["horse", "bear", "man"]
      var COLORS = {"red": "#ff0000", "green": "#00ff00", "blue": "#0000bb"}
      var COLOR_NAMES = ["red", "green", "blue"]
      var completed = []
      var airconsole;
      var gameTimer;
      var counter = 120
      var waiting
      var Elf = function(device_id, color) {
        this.device_id = device_id
        this.station = 3
        this.prevStation = 3
        this.speed = 250

        if (color === "red") {
          this.elf = game.add.sprite(game.world.centerX - 120, game.world.centerY + 50, color + 'elf');
        } else if (color === "blue") {
          this.elf = game.add.sprite(game.world.centerX - 56, game.world.centerY + 50, color + 'elf');
        } else {
          this.elf = game.add.sprite(game.world.centerX + 8, game.world.centerY + 50, color + 'elf');

        }
        this.elf.anchor.setTo(0.5, 0.5);
        this.elf.animations.add('walk', [0,1], 10, true)
        this.elf.animations.add('work', [2,3], 10, true)
        this.goalX = this.elf.x
        this.goalY = this.elf.y
        game.physics.enable(this.elf, Phaser.Physics.ARCADE);
        this.traveling = false;
        this.working = false;
        var item = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)]
        var color = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]
        this.inventory = {item: ITEMS[item][Math.floor(Math.random() * ITEMS[item].length)], color: COLORS[color]}
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        if (airconsole) {
          airconsole.message(this.device_id, message)
        }
      }
      Elf.prototype.getNewItem = function() {
        var item = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)]
        this.inventory.item = ITEMS[item][Math.floor(Math.random() * ITEMS[item].length)]
        var message = {action: "INVENTORY_UPDATE", item: this.inventory.item, color: this.inventory.color}
        airconsole.message(this.device_id, message)
      }

      Elf.prototype.startWorking = function() {
        this.elf.animations.play('work');
        elf.working = true;
        var timer = game.time.events.add(Phaser.Timer.SECOND, function() {
          game.time.events.remove(timer)
          elf.working = false;
          this.elf.animations.stop()
          this.elf.frame = 0
          stations[this.station].addItem(this.inventory.item)
          this.getNewItem()
          console.log({action: "STATION_UPDATE", station_items: stations[this.station].items.items})
          airconsole.message(this.device_id, {action: "STATION_UPDATE", station_items: stations[this.station].items})
        }, this);

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
          this.elf.body.velocity.x = -this.speed;
          this.elf.scale.x = 1
        } else if (this.goalX > this.elf.x) {
          this.elf.body.velocity.x = this.speed;
          this.elf.scale.x = -1
        }
        if (this.goalY - 5 < this.elf.y && this.goalY + 5 > this.elf.y) {
          this.elf.body.velocity.y = 0;
          this.elf.y = this.goalY
        } else if (this.goalY < this.elf.y) {
          this.elf.body.velocity.y = -this.speed;
        } else if (this.goalY > this.elf.y) {
          this.elf.body.velocity.y = this.speed;
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

      Station.prototype.reset = function() {
        this.items = {}
        this.complete = false
        this.type = undefined
        this.drawItems()
      }
      Station.prototype.addItem = function(item) {
        console.log("ADDING " + item)
        if (this.items.items === undefined) {
          console.log("undefined  " + item)

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
          if (this.items.items !== undefined) {
            console.log("Not complete")
            var height = 20;
            for (var i = 0; i < this.items.items.length; i++) {

              var newItem = game.add.sprite(this.x, this.y - height, this.items.items[i])
              newItem.anchor.setTo(0.5,0.5)
              newItem.scale.setTo(0.5,0.5)
              height += newItem.height
              console.log(height)
              this.itemsprites.push(newItem)
            }
          }
        } else {
          completed.push(game.add.sprite(completed.length * 64, 20, this.type))
          this.items = {}
          this.complete = false;
          this.type = undefined
          for (var i = 0; i < 50; i ++) {
            addSnowflake()
          }
          // var newItem = game.add.sprite(this.x, this.y - 20, this.type)
          // newItem.anchor.setTo(0.5,0.75)
          // this.itemsprites.push(newItem)
        }
      }
      function addSnowflake() {
        var snowflake = game.add.sprite(game.world.randomX, game.world.randomY, 'snowflake')
        snowflake.anchor.setTo(0.5, 0.5);
        snowflake.scale.setTo(2,2)
        snowAnim = snowflake.animations.add('flake')
        snowAnim.onComplete.add(function() {
          snowflake.destroy()
        }, this);
        snowAnim.play( 10, false)
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
        game.load.spritesheet('snowflake', require('./assets/Snowflake.png'), 64, 64)
        game.load.spritesheet('intro', require('./assets/intro.png'), 800, 600)

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
        game.load.audio('backmusic', './music.mp3')
      }
      var stations;
      var elves;
      var intro
      function create () {
        var audio = game.add.audio('backmusic')
        audio.play()
        audio.loopFull()
        game.stage.smoothed = false
        game.add.sprite(0,0, 'background')

          elves = {}

          stations = []
          stations.push(new Station(150,300))
          // stations[0].items = {items: ["horselegs", "horsebody"], color: ""}
          // stations[0].addItem("horsehead")
          // stations[0].addItem("manbody")
          // stations[0].reset()
          // stations[0].addItem("manlegs")

          stations.push(new Station(150,500))
          // stations[1].items = {items: ["manlegs", "manbody"], color: ""}
          // stations[1].addItem("manhead")
          // stations[1].drawItems();
          stations.push(new Station(500,500))
          // stations[2].items = {items: ["bearbody"], color: ""}
          // stations[2].addItem("bearhead")
          // stations[2].drawItems();
          stations.push(new Station(500,300))
          intro = game.add.sprite(0,0,'intro')
          intro.animations.add('wobble', [0,1,2,3], 10, true)
          intro.animations.play('wobble')
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
            var active_players = airconsole.getActivePlayerDeviceIds();
            var connected_controllers = airconsole.getControllerDeviceIds();
            if (active_players.length == 0) {
              if (connected_controllers.length >= 3) {
                airconsole.setActivePlayers(3)

                waiting.setText("Press screen to start")
                airconsole.broadcast({action: "GAME_READY", score: 75})

              } else {
                waiting.setText('Waiting for ' + (3 - connected_controllers.length) + "\nmore players")
              }
            }
          };
          airconsole.onDisconnect = function(device_id) {
            var active_players = airconsole.getActivePlayerDeviceIds();
            var connected_controllers = airconsole.getControllerDeviceIds();
            if (active_players.length == 0) {
                waitingsetText('Waiting for ' + (3 - connected_controllers.length) + "\nmore players");
                waiting.anchor.setTo(0.5, 0.5)
            } else {
              elves[device_id].elf.destroy()
              elves[device_id] = null
            }

          }
          airconsole.onMessage = function(device_id, data) {
            console.log(data)
            console.log(device_id)
            var elf = elves[device_id]
            if (data.action == "START_GAME") {
              var colors = ["red", "green", "blue"]
              waiting.setText("")

              for (var i = 0; i < 3; i++) {
                device_id = airconsole.convertPlayerNumberToDeviceId(i)
                if (elves[device_id] === null) {
                  elves[device_id] = new Elf(device_id, colors[i])
                }
              }
              gameTimer = game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);
              intro.destroy()

            } else if (elf != null && data.action == "MOVE_STATION") {
              elf.gotoStation(data.station)
            } else if (elves[device_id] != null && data.action == "TRASH_STATION") {
              elf.elf.animations.play('work');
              elf.working = true;
              var timer = game.time.events.add(Phaser.Timer.SECOND*2, function() {
                game.time.events.remove(timer)
                elf.working = false;
                elf.elf.animations.stop()
                elf.elf.frame = 0
                stations[elf.station].reset();
                airconsole.message(elf.device_id, {action: "TRASH_FINISH"})
                airconsole.message(elf.device_id, {action: "STATION_UPDATE", station_items: stations[elf.station].items})
              }, this);

            } else if (elves[device_id] != null && data.action == "USE_ITEM") {
              if (data.item == "item" && !elf.working) {
                elf.startWorking()
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
          text = game.add.text(game.world.width - 10, 0, '120', { font: "32px Verdana", fill: "#ffffff", align: "center" });
          text.anchor.setTo(1, 0);
          waiting = game.add.text(game.world.centerX, game.world.centerY - 90, 'Waiting for 3\nmore players', { font: "64px Verdana", fill: "#ffffff", align: "center" });
          waiting.anchor.setTo(0.5, 0.5)
      }
      function update() {
        for (elf in elves) {
          elves[elf].update();
        }

      }

      function updateCounter() {
        counter--;
        text.setText(counter);
        if (counter < 0) {
          text.setText(0);
          game.time.events.remove(gameTimer)
          gameFinish()
        }
      }

      function gameFinish() {
          airconsole.broadcast({action: "GAME_READY", score: 75})

          for (s in stations) {
            stations[s].reset()
          }
          for (c in completed) {
            completed[c].destroy()
          }
          completed = []
          counter = 120
          text.setText(120);
      }



  };
