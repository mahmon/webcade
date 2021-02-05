const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

const gameTitle = 'BREAKOUT';
const gameOverTitle = 'GAME OVER';
const startIntructions = 'Press Enter to play';
const replayIntructions = 'Press Enter to play again';

const titleFont = '24px Arial';
const uiFont = '14px Arial';
const uiY = 20;
const left = 'left';
const center = 'center';
const right = 'right';

const spriteColour = '#dd1111';
const titleTextColour = '#dddd11';
const uiTextColour = '#00aaff';

const gameOverStart = true;
const scoreStart = 0;
const highScoreStart = 0;
const startLives = 3;

const ballRadius = 10;
const ballStartY = canvasH - ballRadius;
const startDelta = 1.0;

const paddleW = 80;
const paddleH = 10;
const startPaddleX = (canvasW - paddleW) / 2;
const startPaddleY = canvasH - paddleH;
const startPaddleDX = 5 * startDelta;

const brickW = 55;
const brickH = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 10;
const brickCenterShift = 8;

// Game Start Settings
let gameOver = gameOverStart;
let score = scoreStart;
let highScore = highScoreStart;
let lives = startLives;

let leftPressed = false;
let rightPressed = false;

let ballX = generateRandomXStartValue();
let ballY = ballStartY;
let dx = startDelta * generateRandomSign();
let dy = -startDelta;

let paddleX = startPaddleX
let paddleY = startPaddleY
let paddleDX = startPaddleDX;

let brickColumnCount = 7;
let brickRowCount = 3;
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = {
      x: 0,
      y: 0,
      status: 1
    }
  }
}

/*
 * Start Screen
 */
function runStartScreen() {
  drawHighScore();
  drawWelcomeMessage();
  addStartScreenListeners();
}

function drawWelcomeMessage() {
  drawMessageToCenterOfScreen(gameTitle, -20);
  drawMessageToCenterOfScreen(startIntructions, 20);
}

function drawHighScore() {
  let msg = `High Score: ${highScore}`;
  let x = canvasW / 2;
  drawMessageToScreen(msg, x, uiY, center, uiFont, uiTextColour);
}

function addStartScreenListeners() {
  document.addEventListener('keydown', transitionStateMachineOnEnter, true);
}

function removeStartScreenListeners() {
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

function clearStartScreen() {
  removeStartScreenListeners();
  clearCanvas();
}

/*
 * Game Loop
 */
function runGame() {
  gameOver = false;
  addUserInputListeners();
  generateXYValuesForBrickArray();
  runGameLoop();
}

function addUserInputListeners() {
  document.addEventListener('keydown', respondToKeyDown, true);
  document.addEventListener('keyup', respondToKeyUp, true);
}

function removeUserInputListeners() {
  document.removeEventListener('keydown', respondToKeyDown, true);
  document.removeEventListener('keyup', respondToKeyUp, true);
}

function respondToKeyDown(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = true;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftPressed = true;
  }
}

function respondToKeyUp(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = false;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftPressed = false;
  }
}

function generateXYValuesForBrickArray() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      let brickX = (c * (brickW + brickPadding)) + brickOffsetLeft + brickCenterShift;
      let brickY = (r * (brickH + brickPadding)) + brickOffsetTop;
      bricks[c][r].x = brickX;
      bricks[c][r].y = brickY;
    }
  }
}

function runGameLoop() {
  if (!gameOver) {
    clearCanvas();
    respondToUserInput();
    moveSprites();
    drawFrame();
    checkForBrickCollisions();
    checkForBoundaryCollisions();
    checkForPaddleCollision();
    checkForLifeLossConditions();
    checkForGameOver();
    requestAnimationFrame(runGameLoop);
  }
}

function respondToUserInput() {
  if (rightPressed) {
    if (paddleX + paddleW < canvasW) {
      paddleX += paddleDX;
    }
  }
  if (leftPressed) {
    if (paddleX > 0) {
      paddleX -= paddleDX;
    }
  }
}

function moveSprites() {
  ballX += dx;
  ballY += dy;
}

function drawFrame() {
  drawScore();
  drawHighScore();
  drawLives();
  drawSprites();
}

function drawScore() {
  let msg = `Score: ${score}`;
  let x = 10;
  drawMessageToScreen(msg, x, uiY, left, uiFont, uiTextColour);
}

function drawLives() {
  let msg = `Lives: ${lives-1}`;
  let x = canvasW - 10;
  drawMessageToScreen(msg, x, uiY, right, uiFont, uiTextColour);
}

function drawSprites() {
  drawBricks();
  drawPaddle();
  drawBall();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      let brick = bricks[c][r];
      let x = brick.x;
      let y = brick.y;
      let status = brick.status;
      if (status > 0) {
        drawBrick(x, y);
      }
    }
  }
}

function drawBrick(x, y) {
  drawRectangle(x, y, brickW, brickH);
}

function drawPaddle() {
  drawRectangle(paddleX, paddleY, paddleW, paddleH);
}

function drawBall() {
  drawCircle(ballX, ballY, ballRadius);
}

function checkForBrickCollisions() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let brick = bricks[c][r];
      if (brick.status > 0) {
        if (ballX > brick.x && ballX < brick.x + brickW) {
          if (ballY > brick.y && ballY < brick.y + brickH) {
            score += 1;
            brick.status = 0;
            dy = -dy
          }
        }
      }
    }
  }
}

function checkForBoundaryCollisions() {
  if (ballX + ballRadius > canvasW || ballX - ballRadius < 0) {
    dx = -dx;
  } else if (ballY - ballRadius < 0) {
    dy = -dy;
  }
}

function checkForPaddleCollision() {
  if (ballY + ballRadius + paddleH > canvasH && ballY + ballRadius < canvasH && dy > 0) {
    if (ballX >= paddleX && ballX <= paddleX + paddleW) {
      dy = -dy;
      if ((dx < 0 && leftPressed) || (dx > 0 && rightPressed)) {
        dx = dx * 1.3;
      } else if ((dx < 0 && rightPressed) || (dx > 0 && leftPressed)) {
        dx = dx * 0.7;
      }
    }
  }
}

function checkForLifeLossConditions() {
  if (ballY - ballRadius > canvasH) {
    lives -= 1;
    resetAfterLifeLost();
  }
}

function resetAfterLifeLost() {
  leftPressed = false;
  rightPressed = false;
  ballX = generateRandomXStartValue();
  ballY = ballStartY;
  dx = startDelta;
  dy = -startDelta;
}

function checkForGameOver() {
  if (lives == 0) {
    gameOver = true;
    gameState = machine.transition(gameState, 'step'); // gameOver
  }
}

function stopGame() {
  removeUserInputListeners();
  resetGameStartSettings();
}

function resetGameStartSettings() {
  if (score > highScore) {
    highScore = score;
  }
  score = scoreStart;
  lives = startLives;
  leftPressed = false;
  rightPressed = false;
  ballX = generateRandomXStartValue();
  ballY = ballStartY;
  dx = startDelta;
  dy = -startDelta;
  paddleX = startPaddleX
  paddleY = startPaddleY
  paddleDX = startPaddleDX;
}

/*
 * Game Over Screen
 */
function runGameOverScreen() {
  drawMessageToCenterOfScreen(gameOverTitle, -20);
  drawMessageToCenterOfScreen(replayIntructions, 20);
  addGameOverScreenListeners();
}

function addGameOverScreenListeners() {
  document.addEventListener('keydown', transitionStateMachineOnEnter, true);
}

function clearGameOverScreen() {
  removeGameOverScreenListeners();
  clearCanvas();
}

function removeGameOverScreenListeners() {
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

/*
 * Helper methods
 */
function drawMessageToScreen(msg, x, y, align, font, colour) {
  ctx.textAlign = align;
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.fillText(msg, x, y);
}

function drawMessageToCenterOfScreen(msg, shiftY) {
  let x = canvasW / 2;
  let y = (canvasH / 2) + shiftY;
  drawMessageToScreen(msg, x, y, center, titleFont, titleTextColour)
}

function drawRectangle(x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fillStyle = spriteColour;
  ctx.fill();
  ctx.closePath();
}

function drawCircle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = spriteColour;
  ctx.fill();
  ctx.closePath();
}

function transitionStateMachineOnEnter(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step');
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasW, canvasH);
}

function generateRandomXStartValue() {
  return (Math.floor(Math.random() * (canvasW - 4 * ballRadius))) + ballRadius;
}

function generateRandomSign() {
  return Math.round(Math.random()) * 2 - 1;
}

/*
 * STATE MACHINE:
 * Manage game states between off, ready, gameRunning and gameOver
 */
function createMachine(stateMachineDefinition) {
  const machine = {
    value: stateMachineDefinition.initialState,
    transition(currentState, event) {
      const currentStateDefinition = stateMachineDefinition[currentState];
      const destinationTransition = currentStateDefinition.transitions[event];
      if (!destinationTransition) {
        return;
      }
      const destinationState = destinationTransition.target;
      const destinationStateDefinition = stateMachineDefinition[destinationState];
      currentStateDefinition.actions.onExit();
      destinationStateDefinition.actions.onEnter();
      machine.value = destinationState;
      return machine.value;
    }
  };
  return machine;
}

const machine = createMachine({
  initialState: 'off',
  off: {
    actions: {
      onEnter() {},
      onExit() {}
    },
    transitions: {
      step: {
        target: 'ready'
      }
    }
  },
  ready: {
    actions: {
      onEnter() {
        runStartScreen();
      },
      onExit() {
        clearStartScreen();
      }
    },
    transitions: {
      step: {
        target: 'gameRunning'
      }
    }
  },
  gameRunning: {
    actions: {
      onEnter() {
        runGame();
      },
      onExit() {
        stopGame();
      }
    },
    transitions: {
      step: {
        target: 'gameOver',
      }
    }
  },
  gameOver: {
    actions: {
      onEnter() {
        runGameOverScreen();
      },
      onExit() {
        clearGameOverScreen();
      }
    },
    transitions: {
      step: {
        target: 'ready',
      }
    }
  }
});

/*
 * Start State machine running, and set to ready postion
 */
let gameState = machine.value; // off
gameState = machine.transition(gameState, 'step'); // ready
