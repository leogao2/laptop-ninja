var points = 0;

var balls = [];
var ballHalfs = [];
var trail = [];
var images = [];
var imageHalfs = [];

class Ball {
  constructor(sketch) {
    this.sketch = sketch;
    this.r = 80;
    this.x = Math.random() * sketch.width;
    this.y = sketch.height;
    this.vY = sketch.randomGaussian(22, 2);
    this.vX = ((this.x > sketch.width / 2) ? -1 : 1) * (Math.random()) * 5;
    this.aY = -0.5;
    this.sliced = false;
    this.imageIndex = Math.floor(Math.random() * images.length);
  }
  update() {
    this.x += this.vX;
    this.y -= this.vY;
    this.vY += this.aY;
  }
}

var px = 0, py = 0;
var rawx = 0, rawy = 0;
var newpx = 0, newpy = 0;
var globalsketch;

function set_user_pos(x, y) {
  if (!globalsketch) return
  function stretchcoord(x, size, factor) {
    return (x - size / 2) * factor + size / 2
  }

  rawx = x
  rawy = y

  newpx = x / videoWidth * globalsketch.width
  newpx = stretchcoord(newpx, globalsketch.width, 1.3)
  newpy = y / videoHeight * globalsketch.height
  newpy = stretchcoord(newpy, globalsketch.height, 1.3)
  console.log(x / videoWidth, y / videoHeight)
}

function mkgame() {
  var backgroundImg;
  return (sketch) => {
    globalsketch = sketch;
    var appleImg;

    sketch.setup = () => {
      sketch.createCanvas(window.innerWidth - 5, window.innerHeight - 5);
      sketch.f
    };
    sketch.preload = () => {
      let imageList = ['apple.png', 'pear.png', 'watermelon.png', 'plum.png'];
      for (let i = 0; i < imageList.length; i++) {
        images.push(sketch.loadImage('img/' + imageList[i]));
      }
      backgroundImg = sketch.loadImage('img/background.png');
    }

    sketch.draw = () => {
      backgroundImg.resize(sketch.width, sketch.height);
      sketch.image(backgroundImg, 0, 0);

      // display score
      sketch.fill(255, 140, 0);
      sketch.textSize(100);
      sketch.stroke(0);
      sketch.strokeWeight(5);
      sketch.textStyle(BOLD);
      sketch.textAlign(sketch.LEFT, sketch.TOP);
      sketch.text(points, 10, 10);
      sketch.textSize(50);

      sketch.textAlign(sketch.CENTER, sketch.TOP);

      for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        let image = images[ball.imageIndex];
        ball.update();
        // hit detection
        let distFromCenter = Math.sqrt((ball.x - px) ** 2 + (ball.y - py) ** 2);
        if (ball.sliced) {
        } else if (distFromCenter < ball.r) {
          ball.sliced = true;
          balls.splice(i, 1)
          points++;
          let leftImage = image.get(0, 0, image.width/2, image.height);
          let rightImage = image.get(image.width/2, 0, image.width/2, image.height);
          imageHalfs.push(leftImage);
          imageHalfs.push(rightImage);

          let leftBallHalf = new Ball(sketch);
          leftBallHalf.imageIndex = ballHalfs.length;
          leftBallHalf.x = ball.x;
          leftBallHalf.y = ball.y;
          leftBallHalf.vX = ball.vX - 3;
          leftBallHalf.vY = ball.vY;
          leftBallHalf.sliced = true;
          ballHalfs.push(leftBallHalf);

          let rightBallHalf = new Ball(sketch);
          rightBallHalf.imageIndex = ballHalfs.length;
          rightBallHalf.x = ball.x + image.width/2;
          rightBallHalf.y = ball.y;
          rightBallHalf.vX = ball.vX + 3;
          rightBallHalf.vY = ball.vY;
          rightBallHalf.sliced = true;
          ballHalfs.push(rightBallHalf);

        }
        if (ball.y > sketch.height) {
          balls.splice(i, 1);
        }

        image.resize(ball.r * 2, 0);
        sketch.image(image, ball.x - ball.r, ball.y - ball.r);
        sketch.fill(0);
      }

      for (let i = 0; i < ballHalfs.length; i++) {
        let ballHalf = ballHalfs[i];
        let image = imageHalfs[ballHalf.imageIndex];
        ballHalf.update();
        image.resize(ballHalf.r, 0);
        sketch.image(image, ballHalf.x - ballHalf.r, ballHalf.y - ballHalf.r);
      }


      if (sketch.frameCount % 50 == 0) {
          balls.push(new Ball(sketch))
      }
      const trailThickness = 10;
      // Create mouse trail
      sketch.fill(255, 0, 0);
      sketch.stroke(255, 0, 0);
      //console.log(sketch.mouseX, sketch.mouseY)
      sketch.ellipse(px, py, 10, 10);

      if (trail.length > 0) {
        var lastTrail = trail[trail.length - 1];
        var distFromTrail = Math.sqrt((px - lastTrail.x) ** 2 + (py - lastTrail.y) ** 2);
      }
      if (trail.length == 0 || distFromTrail > 10) {
        trail.push({x: px, y: py});
      }

      if (sketch.frameCount % 4 == 0 || trail.length > 15) {
        trail.shift();
      }

      for (let i = 0; i < trail.length - 1; i++) {
        // Get thicker closer to point
        sketch.strokeWeight(trail.length * i/trailThickness);
        sketch.line(trail[i].x, trail[i].y, trail[i + 1].x, trail[i + 1].y);
      }
      // Reset to default
      sketch.strokeWeight(0);
      sketch.stroke(0);

      if (sketch.frameCount % 2 == 0) {

        pred().then(preds => {
          if (!preds) return;
          //console.log(preds)
          //console.log(preds.keypoints[0].position)
          let searchpart = 'rightWrist';
          let i = 0
          if (preds.length == 1)
            preds = preds[0]
          for(obj of preds.keypoints) {
            if (obj.part == searchpart) break
            i++
          }


          function stretchcoord(x, size, factor) {
            return (x - size / 2) * factor + size / 2
          }
          if ( preds.keypoints[i].score < 0.2) return

          rawx = preds.keypoints[i].position.x
          rawy = preds.keypoints[i].position.y
          set_user_pos(rawx, rawy)
          //if (preds.length > 0) {
          //  let x = (preds[0].bbox[0] + preds[0].bbox[2]) / 2;
          //  let y = (preds[0].bbox[1] + preds[0].bbox[3]) / 2;
          //  console.log(x, y)
          //  px = x
          //  py = y
          //}
        })

      }
      let smoothingfactor = 0.95

      px = smoothingfactor * px + (1 - smoothingfactor) * newpx
      py = smoothingfactor * py + (1 - smoothingfactor) * newpy

      context.beginPath();
      context.arc(videoWidth - rawx, rawy, 5, 0, 2 * Math.PI, false);
      context.fillStyle = 'red';
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = '#330000';
      context.stroke();
    }
  };
}
