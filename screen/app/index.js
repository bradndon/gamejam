window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

window.onload = function() {
      var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

      var Elf = function() {
        this.goalX = 0
        this.goalY = 0
        this.station = 0
        this.elf = game.add.sprite(game.world.centerX, game.world.centerY, 'elf');
        this.elf.anchor.setTo(0.5, 0.5);
        game.physics.enable(this.elf, Phaser.Physics.ARCADE);
        this.elf.body.velocity.x = 20
        this.traveling = false;
      }
      Elf.prototype.gotoStation = function(station) {
        console.log(station)
        this.goalX = stations[station].x;
        this.goalY = stations[station].y;
        this.station = station
      }

      Elf.prototype.update = function() {
        if (this.goalX - 5 < this.elf.x && this.goalX + 5 > this.elf.x) {
          this.elf.body.velocity.x = 0;
          this.elf.x = this.goalX
        }  else if (this.goalX < this.elf.x) {
          this.elf.body.velocity.x = -50;
        } else if (this.goalX > this.elf.x) {
          this.elf.body.velocity.x = 50;
        }
        if (this.goalY - 5 < this.elf.y && this.goalY + 5 > this.elf.y) {
          this.elf.body.velocity.y = 0;
          this.elf.y = this.goalY
        } else if (this.goalY < this.elf.y) {
          this.elf.body.velocity.y = -50;
        } else if (this.goalY > this.elf.y) {
          this.elf.body.velocity.y = 50;
        }

      }

      function preload () {

        game.load.image('elf', require('./assets/elf.png'));
        game.load.image('station', require('./assets/station.png'));

      }
      var stations;
      var elf;
      function create () {


          stations = []
          stations.push(game.add.sprite(100,100, 'station'))
          stations[0].scale.setTo(2,2)
          stations[0].anchor.setTo(0.5,0.5)
          stations.push(game.add.sprite(130,200, 'station'))
          stations[1].anchor.setTo(0.5,0.5)
          stations.push(game.add.sprite(200,200, 'station'))
          stations[2].anchor.setTo(0.5,0.5)
          stations.push(game.add.sprite(200,100, 'station'))
          stations[3].anchor.setTo(0.5,0.5)




          airconsole = new AirConsole();
              airconsole.onReady = function() { elf = new Elf();};
                airconsole.onConnect = function(device_id) {
                  
                };
              airconsole.onMessage = function(device_id, data) {
                console.log(data)
                if (elf != null) {
                  elf.gotoStation(data.station)
                }
              }
      }
      function update() {
        if (elf != null) {
          elf.update()
        }
      }


  };
