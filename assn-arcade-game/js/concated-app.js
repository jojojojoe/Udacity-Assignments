/* Resources.js
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function(window) {
    'use strict';
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function load(urlOrArr) {
        if (urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _load(url) {
        if (resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if (isReady()) {
                    readyCallbacks.forEach(function(func) {
                        func();
                    });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /* This is used by developers to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    /* This function determines if all of the images that have been requested
     * for loading have in fact been properly loaded.
     */
    function isReady() {
        var ready = true;
        for (var k in resourceCache) {
            if (resourceCache.hasOwnProperty(k) &&
                !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };

    // app.js
    // 'use strict';
    // define a parent class, I don't know what name is better...
    var Actor = function(x, y) {
        this.x = x;
        this.y = y;
    };

    // Draw the enemy on the screen, required method for game
    Actor.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    // Enemies our player must avoid
    function Enemy(x, y, speed) {
        this.x = x - 100;
        this.y = y + 70;
        this.speed = speed;
        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = 'images/enemy-bug.png';
    }
    Enemy.prototype = Object.create(Actor.prototype);
    Enemy.prototype.constructor = Enemy;


    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    Enemy.prototype.update = function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        if (player.lives > 0) {
            this.x += this.speed * dt;
            if (this.x > ctx.canvas.width) {
                this.x = -100;
            }
        }
    };

    // Now write your own player class
    // This class requires an update(), render() and
    // a handleInput() method.
    function Player(x, y, lives, imgURL) {
        this.sprite = imgURL;
        this.x = x;
        this.y = y;
        this.lives = lives;
        this.score = 0;
    }

    Player.prototype = Object.create(Actor.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.update = function() {
        //跟踪 player enemy 的位置，是否碰到
        // check if collision with enemy. If collided, set the score to 0 
        // and reduce 1 life.
        var self = this;
        allEnemies.forEach(function(enemy) {
            var imgWidth = 83;
            var imgHeight = 73;
            if (self.x < enemy.x + imgWidth &&
                self.x + imgWidth > enemy.x &&
                self.y < enemy.y + imgHeight &&
                self.y + imgHeight > enemy.y) {
                self.x = 200;
                self.y = 410;
                self.updateScoreOrLives(0, true);
            }
        });

        //check if touched a star
        allStars.forEach(function(star) {
            var xdistance = Math.abs(star.x - self.x);
            var ydistance = Math.abs(star.y - self.y);
            if (xdistance < 30 && ydistance < 30) {
                var starIndex = allStars.indexOf(star);
                allStars.splice(starIndex, 1);
                self.score += 1;
                updateInfoDiv(self.score, self.lives);
            }
        });


    };

    Player.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        //if lost all lives, change hero color to gray
        if (this.lives <= 0) {
            this.sprite = 'images/char-boy-lost.png';
        }
    };

    Player.prototype.handleInput = function(key) {
        //move the hero by keyboard
        if (this.lives > 0) {
            switch (key) {
                case 'left':
                    this.x -= 100;
                    break;
                case 'right':
                    this.x += 100;
                    break;
                case 'up':
                    this.y -= 83;
                    break;
                case 'down':
                    this.y += 83;
                    break;
            }
        }

        //if the hero jumping out of the boundaries, reset the hero's positoin
        if (this.y > ctx.canvas.height - 150 || this.x < 0 || this.x > 410) {
            this.x = 200;
            this.y = 410;
        }
        //if the hero reach the river, the player wins, then replace the canvas
        //content to a win message
        if (this.y < 0) {
            var myContainer = document.getElementById('myContainer');
            var winMsg = document.createElement('h1');
            winMsg.textContent = "YOU WIN!";
            var canvas = document.getElementsByTagName('canvas')[0];
            myContainer.replaceChild(winMsg, canvas);
            this.score += 100;
            this.updateScoreOrLives(this.score, 0);
        }
    };

    Player.prototype.updateScoreOrLives = function(score, lostOneLife) {
        player.score = score;
        if (lostOneLife) {
            player.lives -= 1;
        }
        updateInfoDiv(player.score, player.lives);
    };

    var updateInfoDiv = function(score, lives) {
        var livesDiv = document.getElementById("lives");
        var scoreDiv = document.getElementById("score");
        livesDiv.textContent = "Lives: " + lives;
        scoreDiv.textContent = "Score: " + score;
    };


    //place ths Stars and Gems to score
    var Star = function(x, y, sprite) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
    };
    Star.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    Star.prototype.update = function() {

    };
    // Now instantiate your objects.
    // Place all enemy objects in an array called allEnemies
    // Place the player object in a variable called player

    var enemy1 = new Enemy(11, 0, 100);
    var enemy2 = new Enemy(-30, 83, 80);
    var enemy3 = new Enemy(200, 166, 160);
    var enemy30 = new Enemy(-50, 166, 160);
    var enemy4 = new Enemy(100, 249, 260);
    var allEnemies = [enemy1, enemy2, enemy30, enemy3, enemy4];


    var player = {};
    //chooose a hero for player
    var imgs = document.getElementsByTagName('img');
    var heroImgUrl = null;
    for (var i = imgs.length - 1; i >= 0; i--) {
        imgs[i].addEventListener("click", chooseHero);
    }

    function chooseHero(evt) {
        if (evt) {
            var selectHero = evt.srcElement;
            selectHero.style.backgroundColor = "lightcyan";
            for (var i = imgs.length - 1; i >= 0; i--) {
                //remove non-selected heros
                if (imgs[i] != selectHero) {
                    var heroContainerDiv = document.getElementById("heros");
                    heroContainerDiv.removeChild(imgs[i]);
                }
            }
            heroImgUrl = selectHero.attributes.src.value;
            player = new Player(200, 410, 5, heroImgUrl);
        }
    }

    //instantiate stars
    var starUrl = 'images/Star.png';
    var gemUrl = 'images/Gem Blue.png';
    var star1 = new Star(0, 0, starUrl);
    var star2 = new Star(100, 83, starUrl);
    var star3 = new Star(100, 166, starUrl);
    var star4 = new Star(200, 83, starUrl);
    var star5 = new Star(400, 249, starUrl);
    var allStars = [star1, star2, star3, star4, star5];


    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(allowedKeys[e.keyCode]);
    });

    /* Engine.js
     * This file provides the game loop functionality (update entities and render),
     * draws the initial game board on the screen, and then calls the update and
     * render methods on your player and enemy objects (defined in your app.js).
     *
     * A game engine works by drawing the entire game screen over and over, kind of
     * like a flipbook you may have created as a kid. When your player moves across
     * the screen, it may look like just that image/character is moving or being
     * drawn but that is not the case. What's really happening is the entire "scene"
     * is being drawn over and over, presenting the illusion of animation.
     *
     * This engine is available globally via the Engine variable and it also makes
     * the canvas' context (ctx) object globally available to make writing app.js
     * a little simpler to work with.
     */

    var Engine = (function(global) {
        /* Predefine the variables we'll be using within this scope,
         * create the canvas element, grab the 2D context for that canvas
         * set the canvas elements height/width and add it to the DOM.
         */

        var doc = global.document,
            win = global.window,
            canvas = doc.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            lastTime;


        var divContainer = doc.getElementById("myContainer");
        var divInfo = doc.getElementById("info");
        canvas.width = 505;
        canvas.height = 606;
        // divContainer.appendChild(canvas);
        divContainer.insertBefore(canvas, divInfo);


        // scoreDiv.id = "score";
        // doc.body.appendChild(scoreDiv);

        /* This function serves as the kickoff point for the game loop itself
         * and handles properly calling the update and render methods.
         */
        function main() {
            /* Get our time delta information which is required if your game
             * requires smooth animation. Because everyone's computer processes
             * instructions at different speeds we need a constant value that
             * would be the same for everyone (regardless of how fast their
             * computer is) - hurray time!
             */
            var now = Date.now(),
                dt = (now - lastTime) / 1000.0;

            /* Call our update/render functions, pass along the time delta to
             * our update function since it may be used for smooth animation.
             */
            // update(dt);
            // render();

            //make sure a hero is selected before update and render the canvas
            if (heroImgUrl) {
                update(dt);
                render();

            }

            /* Set our lastTime variable which is used to determine the time delta
             * for the next time this function is called.
             */
            lastTime = now;

            /* Use the browser's requestAnimationFrame function to call this
             * function again as soon as the browser is able to draw another frame.
             */
            win.requestAnimationFrame(main);
        }

        /* This function does some initial setup that should only occur once,
         * particularly setting the lastTime variable that is required for the
         * game loop.
         */
        function init() {
            reset();
            lastTime = Date.now();
            main();
        }

        /* This function is called by main (our game loop) and itself calls all
         * of the functions which may need to update entity's data. Based on how
         * you implement your collision detection (when two entities occupy the
         * same space, for instance when your character should die), you may find
         * the need to add an additional function call here. For now, we've left
         * it commented out - you may or may not want to implement this
         * functionality this way (you could just implement collision detection
         * on the entities themselves within your app.js file).
         */
        function update(dt) {
            updateEntities(dt);
            // checkCollisions();
        }

        /* This is called by the update function and loops through all of the
         * objects within your allEnemies array as defined in app.js and calls
         * their update() methods. It will then call the update function for your
         * player object. These update methods should focus purely on updating
         * the data/properties related to the object. Do your drawing in your
         * render methods.
         */
        function updateEntities(dt) {
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });

            player.update();
        }

        /* This function initially draws the "game level", it will then call
         * the renderEntities function. Remember, this function is called every
         * game tick (or loop of the game engine) because that's how games work -
         * they are flipbooks creating the illusion of animation but in reality
         * they are just drawing the entire screen over and over.
         */
        function render() {
            /* This array holds the relative URL to the image used
             * for that particular row of the game level.
             */
            var rowImages = [
                    'images/water-block.png', // Top row is water
                    'images/stone-block.png', // Row 1 of 3 of stone
                    'images/stone-block.png', // Row 2 of 3 of stone
                    'images/stone-block.png', // Row 3 of 3 of stone
                    'images/grass-block.png', // Row 1 of 2 of grass
                    'images/grass-block.png' // Row 2 of 2 of grass
                ],
                numRows = 6,
                numCols = 5,
                row, col;

            /* Loop through the number of rows and columns we've defined above
             * and, using the rowImages array, draw the correct image for that
             * portion of the "grid"
             */
            for (row = 0; row < numRows; row++) {
                for (col = 0; col < numCols; col++) {
                    /* The drawImage function of the canvas' context element
                     * requires 3 parameters: the image to draw, the x coordinate
                     * to start drawing and the y coordinate to start drawing.
                     * We're using our Resources helpers to refer to our images
                     * so that we get the benefits of caching these images, since
                     * we're using them over and over.
                     */
                    ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                }
            }

            renderEntities();
        }

        /* This function is called by the render function and is called on each game
         * tick. Its purpose is to then call the render functions you have defined
         * on your enemy and player entities within app.js
         */
        function renderEntities() {
            /* Loop through all of the objects within the allEnemies array and call
             * the render function you have defined.
             */
            allEnemies.forEach(function(enemy) {
                enemy.render();
            });

            allStars.forEach(function(sth) {
                sth.render();
            });

            player.render();
        }

        /* This function does nothing but it could have been a good place to
         * handle game reset states - maybe a new game menu or a game over screen
         * those sorts of things. It's only called once by the init() method.
         */
        function reset() {
            // noop
        }

        /* Go ahead and load all of the images we know we're going to need to
         * draw our game level. Then set init as the callback method, so that when
         * all of these images are properly loaded our game will start.
         */
        Resources.load([
            'images/stone-block.png',
            'images/water-block.png',
            'images/grass-block.png',
            'images/enemy-bug.png',
            'images/char-boy.png',
            'images/char-boy-lost.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png',
            'images/Gem Blue.png',
            'images/Star.png',
            'images/Gem Blue.png'

        ]);
        Resources.onReady(init);

        /* Assign the canvas' context object to the global variable (the window
         * object when run in a browser) so that developers can use it more easily
         * from within their app.js files.
         */
        global.ctx = ctx;
    })(window);


})(this);