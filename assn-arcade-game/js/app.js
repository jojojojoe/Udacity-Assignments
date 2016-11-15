// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x - 100;
    this.y = y+70;
    this.speed = speed;
};

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

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x, y, lives, imgUrl){
    this.sprite = imgUrl;
    this.y = y;
    this.x = x;
    // this.speed = speed;
    this.lives = lives;
    this.score = 0;
};

Player.prototype.update = function(){
    //跟踪 player enemy 的位置，是否碰到
    // check if collision with enemy. If collided, set the score to 0 
    // and reduce 1 life.
    allEnemies.forEach(function(enemy){
        var xdistance = Math.abs(enemy.x - player.x);
        var ydistance = Math.abs(enemy.y - player.y);
        if (xdistance < 30 && ydistance < 30) {
            player.x = 200;
            player.y = 410;
            updateScoreOrLives(0, true);
        }
    });

    //check if touched a star
    allStars.forEach(function(star){
        var xdistance = Math.abs(star.x - player.x);
        var ydistance = Math.abs(star.y - player.y);
        if (xdistance < 30 && ydistance < 30) {
            var starIndex = allStars.indexOf(star);
            allStars.splice(starIndex, 1);
            player.score += 1;
            updateInfoDiv(player.score, player.lives);
        }
    });


};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //if lost all lives, change hero color to gray
    if (this.lives <= 0) {
        this.sprite = 'images/char-boy-lost.png';
    }
};

Player.prototype.handleInput = function(key){
    //move the hero by keyboard
    if (this.lives > 0) {
        switch(key){
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
    if (this.y > ctx.canvas.height - 150 ||this.x < 0 || this.x > 410) {
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
        updateScoreOrLives(this.score, 0);
    }
};

var updateScoreOrLives = function(score, lostOneLife){
    player.score = score;
    if (lostOneLife) {
        player.lives -= 1;
    }
    updateInfoDiv(player.score, player.lives);
};

var updateInfoDiv = function(score, lives){
    var livesDiv = document.getElementById("lives");
    var scoreDiv = document.getElementById("score");
    livesDiv.textContent = "Lives: " + lives;
    scoreDiv.textContent = "Score: " + score;
};


//place ths Stars and Gems to score
var Star = function(x, y, sprite){
    this.x = x;
    this.y = y;
    this.sprite = sprite;
};
Star.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Star.prototype.update = function(){

};
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var enemy1 = new Enemy(11, 0, 100);
var enemy2 = new Enemy(-30, 83, 80);
var enemy3 = new Enemy(200, 166, 160);
var enemy30 = new Enemy(-50, 166, 160);
var enemy4 = new Enemy(100, 249, 260);
var allEnemies = [enemy1, enemy2, enemy30,enemy3, enemy4];


var player = {};
//chooose a hero for player
var imgs = document.getElementsByTagName('img');
var heroImgUrl = null;
for (var i = imgs.length - 1; i >= 0; i--) {
    imgs[i].addEventListener("click", chooseHero);
}
function chooseHero(evt){
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
    player = new Player(200, 410, 2, heroImgUrl);
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
