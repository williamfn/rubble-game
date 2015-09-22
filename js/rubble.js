var game = new Phaser.Game(480, 360, Phaser.AUTO, null, {
    preload: preload, create: create, update: update
});

var ball;
var paddle;
var paddleHalfWidth;

var bricks;
var newBrick;
var brickInfo;

var scoreText;
var score = 0;

var lives = 3;
var livesText;
var lifeLostText;

var textStyle = { font: '18px Arial', fill: '#0095DD' };

var playing = false;
var startButton;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#eee';
  game.load.image('ball', 'assets/ball.png');
  game.load.image('paddle', 'assets/paddle.png');
  game.load.image('brick', 'assets/brick.png');
  game.load.spritesheet('ball', 'assets/wobble.png', 20, 20);
  game.load.spritesheet('button', 'assets/button.png', 120, 40);
}
function create() {
  ball = game.add.sprite(game.world.centerX, game.world.centerY, 'ball');
  ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
  paddle = game.add.sprite(game.world.centerX, game.world.height-5, 'paddle');
  paddleHalfWidth = paddle.width / 2;
  startButton = game.add.button(game.world.centerX, game.world.centerY, 'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;

  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);

  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);

  paddle.anchor.set(0.5, 1);
  paddle.body.immovable = true;

  initBricks();

  scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
  livesText = game.add.text(game.world.width-5, 5, 'Lives: ' + lives, textStyle);
  livesText.anchor.set(1,0);
  lifeLostText = game.add.text(game.world.centerX, game.world.centerY, 'Life lost, click to continue', textStyle);
  lifeLostText.anchor.set(0.5);
  lifeLostText.visible = false;
}
function update() {
  if(playing) {
      paddle.x = game.input.x;
  }

  paddleUpdate(paddle);

  game.physics.arcade.collide(ball, paddle, ballHitPaddle);
  game.physics.arcade.collide(ball, bricks, ballHitBrick);
}

function initBricks() {
  brickInfo = {
    width: 50,
    height: 20,
    count: {
        row: 7,
        col: 3
    },
    offset: {
        top: 50,
        left: 60
    },
    padding: 10
  };

  bricks = game.add.group();

  for(c=0; c<brickInfo.count.col; c++) {
    for(r=0; r<brickInfo.count.row; r++) {
      var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
      var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
      newBrick = game.add.sprite(brickX, brickY, 'brick');
      game.physics.enable(newBrick, Phaser.Physics.ARCADE);
      newBrick.body.immovable = true;
      newBrick.anchor.set(0.5);
      bricks.add(newBrick);
    }
  }
}

function ballHitBrick(ball, brick) {
  var killTween = game.add.tween(brick.scale).to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
  killTween.onComplete.addOnce(function(){ brick.kill(); }, this);
  killTween.start();
  score += 10;
  scoreText.setText('Points: '+score);
  if(score === brickInfo.count.row * brickInfo.count.col * 10) {
    alert('You won the game, congratulations!');
    location.reload();
  }
}

function ballLeaveScreen() {
  lives--;
  if(lives) {
    livesText.setText('Lives: '+lives);
    lifeLostText.visible = true;
    ball.reset(game.world.centerX - 9, game.world.height * 0.6);
    paddle.reset(game.world.centerX, game.world.height-5);
    game.input.onDown.addOnce(function(){
      lifeLostText.visible = false;
      ball.body.velocity.set(150, -150);
    }, this);
  }
  else {
    alert('You lost, game over!');
    location.reload();
  }
}

function ballHitPaddle(ball, paddle) {
  ball.animations.play('wobble');
  ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}

function startGame() {
  startButton.destroy();
  ball.body.velocity.set(150, -150);
  playing = true;
}

function paddleUpdate(paddle) {
  if (paddle.x < paddleHalfWidth) {
    paddle.x = paddleHalfWidth;
  } else if (paddle.x > game.world.width - paddleHalfWidth) {
    paddle.x = game.world.width - paddleHalfWidth;
  }
}
