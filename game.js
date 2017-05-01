
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('item', 'assets/powerup1.png');
    this.load.spritesheet('greenEnemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
    this.load.spritesheet('player2', 'assets/shooting-enemy.png', 32, 32);
    this.load.audio('explosion', ['assets/explosion.ogg', 'assets/explosion.wav']);
    this.load.audio('playerExplosion', ['assets/player-explosion.ogg', 'assets/player-explosion.wav']);
    this.load.audio('enemyFire', ['assets/enemy-fire.ogg', 'assets/enemy-fire.wav']);
    this.load.audio('playerFire', ['assets/player-fire.ogg', 'assets/player-fire.wav']);
    this.load.audio('powerUp', ['assets/powerup.ogg', 'assets/powerup.wav']);
    this.load.audio('bgm', ['assets/4bit.ogg', 'assets/4bit.mp3']);
    this.load.audio('fire', 'assets/hit.wav');
  },

  create: function () {

    this.sea = this.add.tileSprite(0, 0, 800, 600, 'sea');

    this.score = 0;
    this.labelScore = this.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 

    this.life = 3;
    this.labelLife = this.add.text(700, 20, "3", { font: "30px Arial", fill: "#ffffff" });  

    this.point = 0;

    this.bgmSound = this.add.audio('bgm');
    this.bgmSound.play();


    // this.enemy = this.add.sprite(400, 200, 'greenEnemy');
    // this.enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    // this.enemy.play('fly');
    // this.enemy.anchor.setTo(0.5, 0.5);
    // this.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(10, 'greenEnemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    // Set the animation for each sprite
    this.enemyPool.forEach(function (enemy) {
    enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    });
    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;


    this.player = this.add.sprite(400, 550, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.player.animations.add('pHit', [ 3, 0, 3, 1, 3, 2 ], 10, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;

    this.playerPool = this.add.group();
    this.playerPool.enableBody = true;
    this.playerPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.playerPool.createMultiple(1, 'player2');
    this.playerPool.setAll('anchor.x', 0.5);
    this.playerPool.setAll('anchor.y', 0.5);
    this.playerPool.setAll('outOfBoundsKill', true);
    this.playerPool.setAll('checkWorldBounds', true);
    this.playerPool.forEach(function (player2) {
    player2.animations.add('fly', [ 0, 1, 2 ], 20, true);
    });
    
    


    // this.bullet = this.add.sprite(400, 300, 'bullet');
    // this.bullet.anchor.setTo(0.5, 0.5);
    // this.physics.enable(this.bullet, Phaser.Physics.ARCADE);
    // this.bullet.body.velocity.y = -200;
    this.bullets = [];
    this.nextShotAt = 0;
    this.shotDelay = 100;


    this.cursors = this.input.keyboard.createCursorKeys();


    this.instructions = this.add.text( 400, 400,
      'Use Arrow Keys to Move, Press M to Fire\n' +
      'Tapping/clicking does both\n'+
      'Press Z for new challenger\n'+
      'Press D,R,F,G to Move Player2\n'+
      'Press A to Player2 Fire',
      { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + 5000; 

    this.items = [];
    this.items.collideWorldBounds = true;
    this.items.outOfBoundsKill = true;
    

    this.explosionSound = this.add.audio('explosion');
    this.powerSound = this.add.audio('powerUp');
    this.fireSound = this.add.audio('fire');
     
     

  },

  update: function () {
    //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
    this.sea.tilePosition.y += 0.2;

    // this.physics.arcade.overlap(this.bullet, this.enemy, this.enemyHit, null, this);
    for (var i = 0; i < this.bullets.length; i++) {
      this.physics.arcade.overlap(this.bullets[i], this.enemyPool, this.enemyHit, null, this);
    }

     this.physics.arcade.overlap(this.player, this.items, this.itemHit, null, this);

     this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);


    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      // spawn at a random location top of the screen
      enemy.reset(this.rnd.integerInRange(20, 780), 0);
      // also randomize the speed
      enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
      enemy.play('fly');
    }
    
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.speed;
    }
    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = this.player.speed;
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.M) ||
      this.input.activePointer.isDown) {
      this.fire();
    }


    if (this.input.keyboard.isDown(Phaser.Keyboard.Z)){
      this.newPlayer(); 

      
      // var player2 = this.playerPool.getFirstExists(false);
      // player2.reset(300, 550);
      
      
      // player2.play('fly');

      
      // // this.physics.enable(player2, Phaser.Physics.ARCADE);
      // player2.speed = 300;
      
      // player2.body.collideWorldBounds = true;
      
      
    }

    
      
    

    // if(this.player2 = true){ 

    //   // this.physics.enable(this.player2, Phaser.Physics.ARCADE);
    //   // this.player2.speed = 300;
    //   //this.player2.body.collideWorldBounds = true;
    //   // this.player2.body.velocity.x = 0;
    //   // this.player2.body.velocity.y = 0;
    //   this.newKeyboard();
    //   //  if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
    //   //   this.player2.body.velocity.x = -this.player2.speed;
    //   // } else if (this.input.keyboard.isDown(Phaser.Keyboard.G)) {
    //   //   this.player2.body.velocity.x = this.player2.speed;
    //   // }
    //   // if (this.input.keyboard.isDown(Phaser.Keyboard.R)) {
    //   //   this.player2.body.velocity.y = -this.player2.speed;
    //   // } else if (this.input.keyboard.isDown(Phaser.Keyboard.F)) {
    //   //   this.player2.body.velocity.y = this.player2.speed;
    //   // }

    //   // if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
    //   //   this.fire2();
    //   // }
    // }

    
      
    

    //if (this.input.activePointer.isDown) {
    if (this.input.activePointer.isDown && this.physics.arcade.distanceToPointer(this.player) > 5) {
      this.physics.arcade.moveToPointer(this.player, this.player.speed);
    }





    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }


  },

  render: function() {
    //this.game.debug.body(this.bullet);
    //this.game.debug.body(this.enemy);

  },

  enemyHit: function (bullet, enemy) {
    //console.log("x: "+this.bullet.x ", y: "+this.bullet.y);

    bullet.kill();
    enemy.kill();
    this.explosionSound.play();
    this.score += 1;
    this.labelScore.text = this.score;
    this.point += 1;
    if(this.point == 20)
    {
      this.add.text(260, 200, "Game Clear", { font: "50px Arial", fill: "#ffffff" });
      this.player.kill();
      this.labelScore.kill();
    }


    var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');
    explosion.play('boom', 15, false, true);

    rnd = Math.floor(Math.random() * 10);
        if (rnd > 5) {
            // var item = this.items.getFirstExists(false);
            // item = this.add.sprite(enemy.position.x,enemy.position.y, 'item');
            
            //this.items.add(this.item);
            
            // item.body.velocity.y = this.items.speed; 

            var item = this.add.sprite(enemy.position.x,enemy.position.y, 'item');
            item.anchor.setTo(0.5, 0.5);
            this.physics.enable(item, Phaser.Physics.ARCADE);
            item.body.velocity.y = 50;
            this.items.push(item);


        }   
  },

  itemHit: function(player, item) {  
        
        item.kill();
        this.powerSound.play();
        rnd = Math.floor(Math.random() * 10);
        if (rnd < 4) {
            this.getBullet();
        } else  {
            this.getScore();
        } 
  },

  playerHit: function(player,enemy){
        var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
        explosion.anchor.setTo(0.5, 0.5);
        explosion.animations.add('boom');
        // explosion.play('boom', 15, false, true);

        if (this.life  !== 1 )
        {
           
          enemy.kill();
          explosion.play('boom', 15, false, true);
          this.explosionSound.play();
          player.play('pHit');
          this.timer = this.time.events.loop(500, this.rePlay, this);

          this.life -= 1;
          this.labelLife.text = this.life;
            
            
        }else {
          

          // enemyPool.destroy();
          player.kill();
          enemy.kill();
          explosion.play('boom', 15, false, true);
          this.explosionSound.play();

          this.life -= 1;
          this.labelLife.text = this.life;
            
            
          this.add.text(260, 200, "Game Over", { font: "50px Arial", fill: "#ffffff" });
          this.bgmSound.destroy(); 
        }

  },
  getBullet: function() {
    this.player.scale.setTo(2, 2);
    this.timer = this.time.events.loop(2000, this.reSize, this);
    },
    
  getScore: function() {
    this.score = this.score + 100;
    this.labelScore.text = this.score;
  },

  reSize: function() {
    this.player.scale.setTo(1, 1);
    this.time.events.remove(this.timer);
  },

  rePlay: function(){
    this.player.play('fly');
    this.time.events.remove(this.timer);
  },



  fire: function() {
    if (this.nextShotAt > this.time.now) {
      return;
    }
    this.nextShotAt = this.time.now + this.shotDelay; 
    this.fireSound.play();

    var bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    this.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.velocity.y = -500;
    this.bullets.push(bullet);
  },

  fire2: function() {
    if (this.nextShotAt > this.time.now) {
      return;
    }
    this.nextShotAt = this.time.now + this.shotDelay;
    this.fireSound.play();  

    var bullet = this.add.sprite(this.player2.x, this.player2.y - 20, 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    this.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.velocity.y = -500;
    this.bullets.push(bullet);
  },

  newPlayer: function(){
    

    var player2 = this.playerPool.getFirstExists(false);
    player2.reset(300, 550);
      
      
    player2.play('fly');

      
      // this.physics.enable(player2, Phaser.Physics.ARCADE);
    player2.speed = 300;
      
    player2.body.collideWorldBounds = true;
    // this.physics.enable(this.player2, Phaser.Physics.ARCADE);
    // this.player2.speed = 300;
    // this.player2.body.collideWorldBounds = true;

  //   this.player2.body.velocity.x = 0;
  //   this.player2.body.velocity.y = 0;

   
    
  },

  newKeyboard: function(){
    if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
        this.player2.body.velocity.x = -this.player2.speed;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.G)) {
        this.player2.body.velocity.x = this.player2.speed;
    }
    if (this.input.keyboard.isDown(Phaser.Keyboard.R)) {
        this.player2.body.velocity.y = -this.player2.speed;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.F)) {
        this.player2.body.velocity.y = this.player2.speed;
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
        this.fire2();
    }
     
  },



  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
