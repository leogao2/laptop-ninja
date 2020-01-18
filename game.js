

var ballX = 300;
var ballY = 500;
var aY = -0.5;
var vY = 20;

var balls = [];

class Ball {
  constructor(sketch) {
    this.x = Math.random() * sketch.width;
    this.y = sketch.height;
    this.vY = sketch.randomGaussian(22, 2);
    this.vX = ((this.x > sketch.width / 2) ? -1 : 1) * (Math.random()) * 5;
    this.aY = -0.5;
  }
  update() {
    this.x += this.vX;
    this.y -= this.vY;
    this.vY += this.aY;
  }
}

var px = 0, py = 0;
function mkgame() {                                                                                                                                                                                                                                   
  return (sketch) => {
  
    sketch.setup = () => {
      sketch.createCanvas(window.innerWidth - 5, window.innerHeight - 5);
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
    
      if (sketch.frameCount % 50 == 0) {
          balls.push(new Ball(sketch))
      }
      // Create mouse trail
      sketch.fill(255, 0, 0);
      //console.log(sketch.mouseX, sketch.mouseY)
      sketch.ellipse(px, py, 10, 10);

      if (sketch.frameCount % 3 == 0) {
        
        pred().then(preds => {
          //console.log(preds.keypoints[0].position)
          px = preds.keypoints[0].position.x / videoWidth * sketch.width
          py = preds.keypoints[0].position.y / videoHeight * sketch.height
          console.log(px, py)
          //if (preds.length > 0) {
          //  let x = (preds[0].bbox[0] + preds[0].bbox[2]) / 2;
          //  let y = (preds[0].bbox[1] + preds[0].bbox[3]) / 2;
          //  console.log(x, y)
          //  px = x
          //  py = y
          //}
        })
      }
    }
    
  };
}
