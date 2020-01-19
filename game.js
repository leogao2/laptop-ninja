var points = 0;

var balls = [];
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
    this.opacity = 1;
  }
  update() {
    this.x += this.vX;
    this.y -= this.vY;
    this.vY += this.aY;

    if (this.sliced) {
      this.opacity -= 0.1;
    }
  }
}

var px = 0, py = 0;
var rawx = 0, rawy = 0;
var newpx = 0, newpy = 0;


function mkgame() {
  return (sketch) => {
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
    }

    sketch.draw = () => {
      sketch.background(255,222,173);

      sketch.fill(0);
      sketch.textSize(40);
      sketch.textAlign(sketch.LEFT, sketch.TOP);
      sketch.text('Score: ' + points, 10, 10);
      sketch.textSize(50);
      sketch.textAlign(sketch.CENTER, sketch.TOP);

      for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        ball.update();
        // hit detection
        let distFromCenter = Math.sqrt((ball.x - px) ** 2 + (ball.y - py) ** 2);
        if (ball.sliced) {
          sketch.fill(255, 0, 0);
        } else if (distFromCenter < ball.r) {
          ball.sliced = true;
          points++;
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


      if (sketch.frameCount % 50 == 0) {
          balls.push(new Ball(sketch))
      }
      const trailThickness = 10;
      // Create mouse trail
      sketch.fill(255, 0, 0);
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
        sketch.stroke(255, 0, 0);
        sketch.line(trail[i].x, trail[i].y, trail[i + 1].x, trail[i + 1].y);

        // Reset to default
        sketch.strokeWeight(1);
        sketch.stroke(255);
      }



      if (sketch.frameCount % 2 == 0) {

        pred().then(preds => {
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
          newpx = preds.keypoints[i].position.x / videoWidth * sketch.width
          newpx = stretchcoord(newpx, sketch.width, 1.3)
          newpy = preds.keypoints[i].position.y / videoHeight * sketch.height
          newpy = stretchcoord(newpy, sketch.height, 1.3)
          // console.log(i, preds.keypoints, preds.keypoints[i].position.x / videoWidth, preds.keypoints[i].position.y / videoHeight)
          //if (preds.length > 0) {
          //  let x = (preds[0].bbox[0] + preds[0].bbox[2]) / 2;
          //  let y = (preds[0].bbox[1] + preds[0].bbox[3]) / 2;
          //  console.log(x, y)
          //  px = x
          //  py = y
          //}
        })

      }
      let smoothingfactor = 0.5

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
