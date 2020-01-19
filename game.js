

var ballX = 300;
var ballY = 500;
var aY = -0.5;
var vY = 20;
var points = 0;

var balls = [];
var trail = [];
var images = [];

class Ball {
  constructor(sketch) {
    this.sketch = sketch;
    this.r = 40;
    this.x = Math.random() * sketch.width;
    this.y = sketch.height;
    this.vY = 20;
    this.vX = ((this.x > sketch.width / 2) ? -1 : 1) * (Math.random()) * 5;
    this.aY = -0.5;
    this.sliced = false;
    this.imageIndex = Math.floor(Math.random() * images.length);
    this.opacity = 1;
  }
  update() {
    this.x += this.vX;
    this.y -= this.vY;
    this.vY += this.aY;

    // hit detection
    let distFromCenter = Math.sqrt((this.x - this.sketch.mouseX) ** 2 + (this.y - this.sketch.mouseY) ** 2);
    if (this.sliced) {
      this.opacity -= 0.1;
    } else if (distFromCenter < this.r) {
      this.sliced = true;
      points++;
    }
  }
}

const s = (sketch) => {
  var appleImg;
  sketch.setup = () => {
    sketch.createCanvas(640, 480);
    sketch.frameRate(30);
  };

  sketch.preload = () => {
    let imageList = ['apple.png', 'pear.png', 'watermelon.png', 'peach.png', 'pineapple.png'];
    for (let i = 0; i < imageList.length; i++) {
      images.push(sketch.loadImage('img/' + imageList[i]));
    }
  }

  sketch.draw = () => {
    sketch.background(255);

    sketch.fill(0);
    sketch.textSize(30);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.text('Score: ' + points, 10, 10);
    for (let i = 0; i < balls.length; i++) {
      let ball = balls[i];
      ball.update();
      if (ball.sliced) {
        sketch.fill(255, 0, 0);
      }
      if (ball.y > sketch.height) {
        balls.splice(i, 1);
      }
      let image = images[ball.imageIndex];
      image.resize(ball.r * 2, 0);
      sketch.tint(255, ball.opacity * 255);
      sketch.image(image, ball.x - ball.r, ball.y - ball.r);
      sketch.fill(0);
    }

    if (sketch.frameCount % 20 == 0) {
        balls.push(new Ball(sketch))
    }
    // Create mouse trail
    var trailThickness = 10;
    sketch.fill(255, 0, 0);
    sketch.ellipse(sketch.mouseX, sketch.mouseY, trailThickness, trailThickness);
    if (trail.length > 0) {
      var lastTrail = trail[trail.length - 1];
      var distFromTrail = Math.sqrt((sketch.mouseX - lastTrail.x) ** 2 + (sketch.mouseY - lastTrail.y) ** 2);
    }
    if (trail.length == 0 || distFromTrail > 10) {
      trail.push({x: sketch.mouseX, y: sketch.mouseY});
    }

    if (sketch.frameCount % 4 == 0 || trail.length > 15) {
      trail.shift();
    }

    for (let i = 0; i < trail.length - 1; i++) {
      // Get thicker closer to point
      sketch.strokeWeight(trail.length * i/trailThickness);
      sketch.stroke(255, 0, 0);
      sketch.line(trail[i].x, trail[i].y, trail[i + 1].x, trail[i + 1].y);

      // Reset to default
      sketch.strokeWeight(1);
      sketch.stroke(255);
    }
  }
};

let myp5 = new p5(s);
