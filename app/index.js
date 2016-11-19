window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')
var AirConsole = require('airconsole/airconsole-1.6.0')

window.onload = function() {


      //  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
      //  Although it will work fine with this tutorial, it's almost certainly not the most current version.
      //  Be sure to replace it with an updated version before you start experimenting with adding your own code.

      var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create });

      function preload () {



      }

      function create () {

          var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
          logo.anchor.setTo(0.5, 0.5);
          var airconsole = new AirConsole();
          airconsole = new AirConsole();
              airconsole.onReady = function() {};

              // As soon as a device connects we add it to our device-map
              airconsole.onConnect = function(device_id) {
                  // Only first two devices can play
                  if (device_control_map.length < 2) {
                      device_control_map.push(device_id);
                      // Send a message back to the device, telling it which role it has (tank or shooter)
                      setRoles();
                  }
                  removeLogo();
              };
      }

  };
