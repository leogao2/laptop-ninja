

var ballX = 300;
var ballY = 500;
var aY = -0.5;
var vY = 20;

var balls = [];

class Ball {
  constructor(sketch) {
    this.x = Math.random() * sketch.width;
    this.y = sketch.height;
    this.vY = 20;
    this.vX = ((this.x > sketch.width / 2) ? -1 : 1) * (Math.random()) * 5;
    this.aY = -0.5;
  }
  update() {
    this.x += this.vX;
    this.y -= this.vY;
    this.vY += this.aY;
  }
}

const s = (sketch) => {

  sketch.setup = () => {
    sketch.createCanvas(640, 480);
  };

  sketch.draw = () => {
    sketch.background(255);
  
    sketch.fill(0);
    sketch.textSize(30);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.text('Score: ', 10, 10);
    for (let i = 0; i < balls.length; i++) {
      let ball = balls[i];
      ball.update();
      sketch.ellipse(ball.x, ball.y, 80, 80);
    }
  
    if (sketch.frameCount % 100 == 0) {
        balls.push(new Ball(sketch))
    }
    // Create mouse trail
    sketch.fill(255, 0, 0);
    sketch.ellipse(sketch.mouseX, sketch.mouseY, 10, 10);
  }
  
};

let myp5 = new p5(s);