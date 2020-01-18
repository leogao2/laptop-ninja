const canvwidth = 640;
const canvheight = 480;

function setup() {
  createCanvas(canvwidth, canvheight);
}

var ballX = 300;
var ballY = 500;
var aY = -0.5;
var vY = 20;

var balls = [];

class Ball {
  constructor() {
    this.x = Math.random() * width;
    this.y = height;
    this.vY = 20;
    this.vX = ((this.x > width / 2) ? -1 : 1) * (Math.random()) * 5;
    this.aY = -0.5;
  }
  update() {
    this.x += this.vX;
    this.y -= this.vY;
    this.vY += this.aY;
  }
}

function draw() {
  background(255);
  // if (fram)
  fill(0);
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    ball.update();
    ellipse(ball.x, ball.y, 80, 80);
  }

  if (frameCount % 100 == 0) {
      balls.push(new Ball())
  }
}
