const canvas = document.getElementById('breakoutCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

let gameTitle = 'BREAKOUT';
let gameOverTitle = 'GAME OVER';
let playInstructions = 'Hit Space to play';

let gameStarted = false;
let gameOver = false;
let leftPressed = false;
let rightPressed = false;
let spriteColor = '#dd1111';
let textColor = '#dddddd';

let ballRadius = 10;
let randBallX = (Math.floor(Math.random() * (canvasW - 4 * ballRadius))) + ballRadius;
let randDX = Math.round(Math.random()) * 2 - 1;
let ballX = randBallX;
let ballY = canvasH + 2 * ballRadius;
let ballLeftEdge = ballX - ballRadius;
let ballRightEdge = ballX + ballRadius;
let ballTopEdge = ballY - ballRadius;
let ballBottomEdge = ballY + ballRadius;
let dx = 4.0 * randDX;
let dy = -dx;

let paddleW = 80;
let paddleH = 10;
let paddleX = (canvasW - paddleW) / 2;
let paddleY = canvasH - paddleH;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = true;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key === ' ') {
    if (gameStarted === false) {
      gameStarted = true;
      runGame();
    }
  } else if (e.key === 'Enter') {
    if (gameOver === true) {
      document.location.reload();
    }
  }
}

function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = false;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftPressed = false;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
  ctx.fillStyle = spriteColor;
  ctx.fill();
  ctx.closePath();
}

function moveBall() {
  ballX += dx;
  ballY += dy;
  ballLeftEdge = ballX - ballRadius;
  ballRightEdge = ballX + ballRadius;
  ballTopEdge = ballY - ballRadius;
  ballBottomEdge = ballY + ballRadius;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, paddleY, paddleW, paddleH);
  ctx.fillStyle = spriteColor;
  ctx.fill();
  ctx.closePath();
}

function checkBoundaryCollision() {
  if (ballRightEdge >= canvasW || ballLeftEdge <= 0) {
    dx = -dx;
  } else if (ballTopEdge <= 0) {
    dy = -dy;
  }
}

function checkPaddleCollision() {
  if (dy > 0 && ballBottomEdge >= canvasH - paddleH) {
    if (ballLeftEdge >= paddleX && ballRightEdge <= paddleX + paddleW) {
      dy = -dy;
    } else {
      if (ballTopEdge > canvasH + ballRadius) {
        gameOver = true;
      }
    }
  }
}

function checkPlayerInput() {
  if (rightPressed) {
    paddleX += 6;
    if (paddleX + paddleW > canvasW) {
      paddleX = canvasW - paddleW;
    }
  } else if (leftPressed) {
    paddleX += -6;
    if (paddleX < 0) {
      paddleX = 0;
    }
  }
}

function drawMessage(text, yPush) {
  let x = (canvasW / 2);
  let y = canvasH / 2 + yPush
  ctx.textAlign = 'center';
  ctx.font = '25px Arial';
  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
}

function drawWelcomeMessage() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawMessage(gameTitle, 0);
  drawMessage(playInstructions, 30);
}

function drawGameOverMessage() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawMessage(gameOverTitle, 0);
  drawMessage(playInstructions, 30);
}

function drawGame() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawBall();
  moveBall();
  drawPaddle();
  checkBoundaryCollision();
  checkPaddleCollision();
  checkPlayerInput();
}

function runGame() {
  console.log(gameOver);
  if (!gameOver) {
    drawGame();
    requestAnimationFrame(runGame);
  } else if (gameOver) {
    drawGameOverMessage();
  }
}

drawWelcomeMessage();
