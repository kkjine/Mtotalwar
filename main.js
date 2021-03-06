

var mainState = {
    preload: function() 
    { 
         game.load.image('bird', 'assets/abird.png');
         game.load.image('pipe', 'assets/realpipe.png');
         game.load.image('upperpipe', 'assets/upperpipe.png');
         game.load.image('downpipe', 'assets/downpipe.png');
         game.load.image('background', 'assets/background.png');
         game.load.audio('jump', 'assets/jump.wav'); 
		 game.load.audio('bgm', 'assets/bgm.wav');
         
         game.load.spritesheet('rbird', 'assets/rbird.png',50,50);
		  


    },

    create: function() 
    { 
        game.stage.backgroundColor = '#71c5cf';
		this.bgmSound = game.add.audio('bgm');
		this.bgmSound.play();
        this.bgmSound.loopFull(0.6);

        game.add.sprite(0,0,'background')
		
        
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'rbird');
        this.bird.animations.add('fly',[0,1,2],10,true);
        


        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5); 

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;  

        // Create an empty group
        this.pipes = game.add.group(); 

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); 

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        var touch = game.input.onDown;
        touch.add(this.jump,this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });   

        this.jumpSound = game.add.audio('jump'); 
		

        


    },

    update: function() 
    {
        this.bird.animations.play('fly');

        if (this.bird.y < 0 || this.bird.y > 490) {
            this.restartGame();
        }

        if (this.bird.angle < 20){
             this.bird.angle += 1; 
        }

        //game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
		
		
        
       
    },

    hitPipe: function()
    {
        if (this.bird.alive == false)
        {
            return;

        }

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;


        }, this);




    },

    jump: function()
    {
        if (this.bird.alive == false)
            return;  
         // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        this.jumpSound.play();

            // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start();  

        
    },

    restartGame: function()
    {
         // Start the 'main' state, which restarts the game
        game.state.start('main');
		this.bgmSound.destroy();

    },
    addRowOfPipes: function() 
    {
    // Randomly pick a number between 1 and 5
    // This will be the hole position
        var hole = Math.floor(Math.random() * 6) + 2;

    // Add the 6 pipes 
    // With one big hole at position 'hole' and 'hole + 1'
        // for (var i = 0; i < 10; i++)
        // {
        //     if (i != hole +1 && i != hole + 2 && i != hole +3 ) 
        //     { 
        //         this.addOnePipe(400, i * 50,'pipe'); 
        //     }else if(i = hole +4) 
        //     {
        //         this.addOnePipe(400, i * 50,'upperpipe');
        //     }else if(i = hole )
        //     {
        //         this.addOnePipe(400, i * 50,'downpipe');
        //     }
        // }

        for (var i = 0; i < hole -1; i++)
        {
            if (i < hole -2 ) 
            { 
                this.addOnePipe(400, i * 50,'pipe'); 
            }else  
            {
                this.addOnePipe(400, i * 50,'downpipe');
            }
        }

        for (var i = 10; i > hole+1; i--)
        {
            if (i > hole + 2 ) 
            { 
                this.addOnePipe(400, i * 50,'pipe'); 
            }else  
            {
                this.addOnePipe(400, i * 50,'upperpipe');
            }
        }

        this.score += 1;
        this.labelScore.text = this.score;  
             
    },
    addOnePipe: function(x, y, ptype) 
    {
    // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, ptype);

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe 
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 

        // Automatically kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
	
	
	
    
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');
