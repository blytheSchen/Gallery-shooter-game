class ShooterGame extends Phaser.Scene {
    constructor() {
        super("shooterGame");

        this.my = {sprite: {}, text: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.playerBullet = [];   
        this.maxPlayerBullets = 10;           // Don't create more than this many bullets
        this.playerBulletCooldown = 12;        // Number of update() calls to wait before making a new bullet
        this.playerBulletCooldownCounter = 0;
        
        //enemy arrays
        this.my.sprite.enemies1 = [];  
        this.maxEnemies1 = 10; 
        this.maxEnemy1MoveCounter = 82;  
        this.enemy1MoveCounter = 82; 

        this.my.sprite.enemies2 = [];  
        this.maxEnemies2 = 2;
        this.enemies2Health = 3;

        this.my.sprite.enemyBullet = [];
        this.maxEnemyBullets = 10; 
        this.enemyBulletCooldown = 10;

        this.currentWave = 0;
        this.score = 0;
        this.health = 5;
        this.pauseScreen = 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("playerBody", "tile_0000.png");
        this.load.image("playerBullet", "laserGreen08.png");

        this.load.image("enemy1", "tile_0025.png");
        this.load.image("enemy2", "tile_0008.png");
        this.load.image("enemyBullet", "laserRed08.png");

        this.load.bitmapFont('pixelFont', 'Kenney Pixel Square_0.png', 'Kenney Pixel Square.fnt');

        //animation stuff
        this.load.image("enemyDeath2", "tile_0007.png");
        this.load.image("enemyDeath1", "tile_0006.png");

        this.load.image("playerHurt", "tile_0001.png");

        //sounds
        this.load.audio('shoot', 'tone1.ogg');
        this.load.audio('playerHit', 'pepSound5.ogg');
        this.load.audio('enemyHit', 'highDown.ogg');
        this.load.audio('nextWave', 'powerUp3.ogg');
    }

    create() {
        let my = this.my;

        my.sprite.playerBody = this.add.sprite(game.config.width/2, game.config.height - 40, "playerBody");
        my.sprite.playerBody.setScale(2.3);

        // creating player bullets
        for (let i=0; i < this.maxPlayerBullets; i++) {
            // create a sprite which is offscreen and invisible
            my.sprite.playerBullet.push(this.add.sprite(-100, -100, "playerBullet"));
            my.sprite.playerBullet[i].setScale(0.6);
            my.sprite.playerBullet[i].visible = false;
        }

        // create enemies
        for (let i=0; i < this.maxEnemies1; i++) {
            my.sprite.enemies1.push(this.add.sprite(-300, -300, "enemy1"));
            my.sprite.enemies1[i].setScale(2.5);
            my.sprite.enemies1[i].visible = false; 
            my.sprite.enemies1[i].scorePoints = 25;
        }

        //create enemy bullets
        for (let i=0; i < this.maxEnemyBullets; i++) {
            my.sprite.enemyBullet.push(this.add.sprite(-300, -300, "enemyBullet"));
            my.sprite.enemyBullet[i].setScale(0.4);
            my.sprite.enemyBullet[i].visible = false; 
            my.sprite.enemyBullet[i].countdown = 7;
        }

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 10;
        this.playerBulletSpeed = 15;

        this.enemy1Speed = 3;
        this.enemy2Speed = 5;

        this.enemyBulletSpeed = 10;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>ShooterGame.js<br>A - move left // D - move right // SPACE - shoot<br>Gain extra score points and health per wave cleared</h2>'

        // text
        // Put score and health on screen
        my.text.score = this.add.bitmapText(500, 0, "pixelFont", "Score: " + this.score);
        my.text.health = this.add.bitmapText(10, 0, "pixelFont", "Health: " + this.health);

        my.text.start = this.add.bitmapText(100, 250, "pixelFont", "Press 'SPACE' to start");
        my.text.start.setFontSize(50); 
        my.text.start.visible = false;

        my.text.end = this.add.bitmapText(50, 250, "pixelFont", "Game over!\nPress 'SPACE' to restart");
        my.text.end.setFontSize(50); 
        my.text.end.visible = false;

        //animation
        this.anims.create({
            key: "enemyDeath",
            frames: [
                { key: "enemyDeath1"},
                { key: "enemyDeath2"}
            ],
            frameRate: 6,
            repeat: 0,
            hideOnComplete: true
        });

        //animation
        this.anims.create({
            key: "playerHurt",
            frames: [
                { key: "playerHurt"},
                { key: "playerBody"}
            ],
            frameRate: 5,
            repeat: 0,
            hideOnComplete: false
        });

        //enemy 2 path points
        this.points = [
            40, 227,
            92, 607,
            164, 224,
            321, 598,
            449, 224,
            522, 595,
            596, 230
        ];

        this.points1 = [
            596, 230,
            522, 595,
            449, 224,
            321, 598,
            164, 224,
            92, 607,
            40, 227
        ];

        this.curve = new Phaser.Curves.Spline(this.points);
        this.curve1 = new Phaser.Curves.Spline(this.points1);

        my.sprite.enemies2.push(this.add.follower(this.curve, -300, -300, "enemy2"));
        my.sprite.enemies2[0].setScale(2.5);
        my.sprite.enemies2[0].visible = false; 
        my.sprite.enemies2[0].scorePoints = 50;
        my.sprite.enemies2[0].health = this.enemies2Health;
        
        my.sprite.enemies2.push(this.add.follower(this.curve1, -300, -300, "enemy2"));
        my.sprite.enemies2[1].setScale(2.5);
        my.sprite.enemies2[1].visible = false; 
        my.sprite.enemies2[1].scorePoints = 50;
        my.sprite.enemies2[0].health = this.enemies2Health;
    }

    update() {
        let my = this.my;
        if (this.pauseScreen == 0) { //start screen
            my.text.start.visible = true;
            if (this.space.isDown) {
                my.text.start.visible = false;
                this.pauseScreen = 1;
            }
        }
        if (this.pauseScreen == 1) { //main game
            this.playerBulletCooldownCounter--;
            this.enemy1MoveCounter--;

            let activeCount = this.maxEnemies1 + this.maxEnemies2;

            // checking whether to move onto next wave
            for (let i=0; i < this.maxEnemies1; i++) {
                if (my.sprite.enemies1[i].visible == false) {
                    activeCount -= 1;
                }
            }
            for (let i=0; i < this.maxEnemies2; i++) {
                if (my.sprite.enemies2[i].visible == false) {
                    activeCount -= 1;
                }
            }

            if (activeCount == 0) {
                this.currentWave += 1;
                this.waveController();
            }

            // game over conditions
            if (this.health <= 0) {
                console.log("Game over!");
                this.pauseScreen = 2;
            }

            //enemy 1 movement
            if (this.enemy1MoveCounter > (this.maxEnemy1MoveCounter / 2) - 1) {
                for (let i=0; i < this.maxEnemies1; i++) {
                    if (my.sprite.enemies1[i].visible)
                    {
                        my.sprite.enemies1[i].x += this.enemy1Speed;
                    }
                }
            } else {
                for (let i=0; i < this.maxEnemies1; i++) {
                    if (my.sprite.enemies1[i].visible)
                    {
                        my.sprite.enemies1[i].x -= this.enemy1Speed;
                    }
                }
            }

            if (this.enemy1MoveCounter <= 0) {
                this.enemy1MoveCounter = this.maxEnemy1MoveCounter;
            }

            // Moving left
            if (this.left.isDown) {
                // Check to make sure the sprite can actually move left
                if (my.sprite.playerBody.x > (my.sprite.playerBody.displayWidth/2)) {
                    my.sprite.playerBody.x -= this.playerSpeed;
                }
            }

            // Moving right
            if (this.right.isDown) {
                // Check to make sure the sprite can actually move right
                if (my.sprite.playerBody.x < (game.config.width - (my.sprite.playerBody.displayWidth/2))) {
                    my.sprite.playerBody.x += this.playerSpeed;
                }
            }

            // Check for bullet being fired
            if (this.space.isDown) {
                if (this.playerBulletCooldownCounter < 0) {
                    // Check for an available bullet
                    for (let playerBullet of my.sprite.playerBullet) {
                        // If the bullet is invisible, it's available
                        if (!playerBullet.visible) {
                            playerBullet.x = my.sprite.playerBody.x;
                            playerBullet.y = my.sprite.playerBody.y - (playerBullet.displayHeight/2); 
                            playerBullet.visible = true;
                            this.playerBulletCooldownCounter = this.playerBulletCooldown;
                            this.sound.play('shoot');
                            break;    // Exit the loop, so we only activate one bullet at a time
                        }
                    }
                }
            }

            // check enemy bullets
            let count = 0;
            for (let enemyBullet of my.sprite.enemyBullet) {
                enemyBullet.countdown--;
                if (enemyBullet.countdown < 0 && my.sprite.enemies1[count].visible) {
                    if (!enemyBullet.visible) {
                        enemyBullet.x = my.sprite.enemies1[count].x;
                        enemyBullet.y = my.sprite.enemies1[count].y + (enemyBullet.displayHeight/2);
                        enemyBullet.visible = true;
                        enemyBullet.countdown = this.enemyBulletCooldown;
                        break; 
                    }
                }
                count++;
            }

            // Check for collision of bullet with the enemy
            for (let bullet of my.sprite.playerBullet) {
                for (let enemy of my.sprite.enemies1) {
                    if (this.collides(enemy, bullet)) {
                        // start animation
                        this.enemyDeath = this.add.sprite(enemy.x, enemy.y, "enemyDeath1").setScale(3.5).play("enemyDeath");
                        this.sound.play('enemyHit');
                        // clear out bullet -- put y offscreen, will get reaped next update
                        bullet.y = -100;
                        enemy.visible = false;
                        enemy.x = -100;
                        // Update score
                        this.score += enemy.scorePoints;
                        this.updateScore();
                    }
                }
            }

            for (let bullet of my.sprite.playerBullet) {
                for (let enemy of my.sprite.enemies2) {
                    if (this.collides(enemy, bullet) && enemy.visible == true) {
                        bullet.y = -100;
                        enemy.health -= 1;
                        this.sound.play('enemyHit');
                        if (enemy.health <= 0) {
                            enemy.stopFollow();
                            // start animation
                            this.enemyDeath = this.add.sprite(enemy.x, enemy.y, "enemyDeath1").setScale(3.5).play("enemyDeath");
                            // clear out bullet -- put y offscreen, will get reaped next update
                            enemy.visible = false;
                            enemy.x = -100;
                            // Update score
                            this.score += enemy.scorePoints;
                            this.updateScore();
                        }
                    }
                }
            }

            // check enemy collision with player
            for (let bullet of my.sprite.enemyBullet) {
                if (this.collides(my.sprite.playerBody, bullet)) {
                    this.playerHurt = my.sprite.playerBody.play("playerHurt");
                    this.sound.play('playerHit');
                    this.health -= 1;
                    this.updateHealth();
                    bullet.y = 700
                }
            }

            for (let enemy of my.sprite.enemies2) {
                if (this.collides(my.sprite.playerBody, enemy) && enemy.visible == true) {
                    this.playerHurt = my.sprite.playerBody.play("playerHurt");
                    this.sound.play('playerHit');
                    this.health -= 2;
                    this.updateHealth();
                    enemy.stopFollow();
                    enemy.visible = false;
                    enemy.x = -300;
                    enemy.y = -300;
                }
            }

            // Make all of the player bullets move
            for (let playerBullet of my.sprite.playerBullet) {
                // if the bullet is visible it's active, so move it
                if (playerBullet.visible) {
                    playerBullet.y -= this.playerBulletSpeed;
                }
                // Did the bullet move offscreen? If so,
                // make it inactive (make it invisible)
                // This allows us to re-use bullet sprites
                if (playerBullet.y < -(playerBullet.displayHeight/2)) {
                    playerBullet.visible = false;
                }
            }
            // make all of the enemy bullets move
            for (let enemyBullet of my.sprite.enemyBullet) {
                // if the bullet is visible it's active, so move it
                if (enemyBullet.visible) {
                    enemyBullet.y += this.enemyBulletSpeed;
                }
                // Did the bullet move offscreen? If so,
                // make it inactive (make it invisible)
                // This allows us to re-use bullet sprites
                if (enemyBullet.y > 700) {
                    enemyBullet.visible = false;
                }
            }
        }
        if (this.pauseScreen == 2) { //game over
            my.text.end.visible = true;
            if (this.space.isDown) {
                this.reset_game();
                this.pauseScreen = 1;
            } 
        }
    }

    reset_game() {
        let my = this.my;
        my.text.end.visible = false;
        this.currentWave = 1;
        this.health = 5;
        this.updateHealth();
        this.score = 0;
        this.updateScore();
        this.playerBulletCooldownCounter = this.playerBulletCooldown;
        this.enemy1MoveCounter = this.maxEnemy1MoveCounter;

        //clear bullets from screen
        for (let bullet of my.sprite.enemyBullet) {
            bullet.visible = false;
        }

        this.waveController();   
        my.sprite.playerBody.x = game.config.width/2;
        my.sprite.playerBody.y = game.config.height - 40;
    }

    waveController() {
        let my = this.my;
        this.sound.play('nextWave');
        if (this.currentWave == 1) {
            this.playerBulletCooldownCounter = this.playerBulletCooldown;
            this.enemy1MoveCounter = this.maxEnemy1MoveCounter;
            console.log("First wave");
            this.stopEnemy2();
            this.startEnemy1();
        }
        if (this.currentWave == 2) {
            console.log("Second wave");
            this.score += 100 * this.health;
            this.updateScore();
            this.health = this.health + 1;
            this.updateHealth();
            this.playerBulletCooldownCounter = this.playerBulletCooldown;
            this.enemy1MoveCounter = this.maxEnemy1MoveCounter;

            this.startEnemy2(my.sprite.enemies2[0], 0);
            this.startEnemy2(my.sprite.enemies2[1], 1);

            this.startEnemy1();
        }
        if (this.currentWave == 3) {
            this.currentWave = 1;
            this.score += 100 * this.health;
            this.waveController();
            this.updateScore();
            this.health = this.health + 1;
            this.updateHealth();
        }
    }

    startEnemy1() {
        let my = this.my;
        let buff = 10;
        for (let i=0; i < this.maxEnemies1; i++) {
            if (i == 0) {
                my.sprite.enemies1[i].x = 65;
                my.sprite.enemies1[i].y = 50;
                my.sprite.enemyBullet[i].countdown = 7;
            }
            else if (i < 6) {
                my.sprite.enemies1[i].x = my.sprite.enemies1[i - 1].x + 80;
                my.sprite.enemies1[i].y = 50;
                my.sprite.enemyBullet[i].countdown = my.sprite.enemyBullet[i - 1].countdown + buff;
                buff = buff * -1;
            }
            else {
                my.sprite.enemies1[i].x = my.sprite.enemies1[i - 1].x - 80;
                my.sprite.enemies1[i].y = 100;  
                my.sprite.enemyBullet[i].countdown = my.sprite.enemyBullet[i - 1].countdown + buff;
                buff = buff * -1;
            }
        }

        for (let i=0; i < this.maxEnemies1; i++) {
            my.sprite.enemies1[i].visible = true;
        }
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score: " + this.score);
    }

    updateHealth() {
        let my = this.my;
        my.text.health.setText("Health: " + this.health);
    }

    startEnemy2(enemy, num) {
        enemy.health = this.enemies2Health;
        if (num == 0) {
            enemy.x = this.curve.points[0].x;
            enemy.y = this.curve.points[0].y;
        }
        if (num == 1) {
            enemy.x = this.curve1.points[0].x;
            enemy.y = this.curve1.points[0].y;
        }

        enemy.visible = true;
        enemy.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 4500,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: true,
            rotationOffset: -90
        });
    }

    stopEnemy2() {
        let my = this.my;
        for (let enemy of my.sprite.enemies2) {
            enemy.stopFollow();
            enemy.visible = false;
            enemy.x = -300;
            enemy.y = -300;
        }
    }
}
         