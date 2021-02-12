const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

const gameTitle = 'BREAKOUT';
const gameOverTitle = 'GAME OVER';
const startIntructions = 'Press Enter to play';
const replayIntructions = 'Press Enter to play again';
const titleFont = '24px sans-serif';
const uiFont = '14px sans-serif';

const uiY = 20;
const left = 'left';
const center = 'center';
const right = 'right';

const spriteColour = '#dd1111';
const spriteColour2 = '#dd4411';
const spriteColour3 = '#dd6611';
const titleTextColour = '#dddd11';
const uiTextColour = '#00aaff';

const gameOverStart = true;
const scoreStart = 0;
const highScoreStart = 0;
const startLives = 3;

const ballRadius = 10;
const ballStartY = canvasH + ballRadius;
const startDelta = 1.0;

const paddleW = 80;
const paddleH = 10;
const startPaddleX = (canvasW - paddleW) / 2;
const startPaddleY = canvasH - paddleH;
const startPaddleDX = 5 * startDelta;

const brickColumnCount = 7;
const brickRowCount = 3;
const brickW = 55;
const brickH = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 10;
const brickCenterShift = 8;

// Game Start Settings
let frame;
let gameOver;
let score;
let highScore;
let highScoresObj;
let lives;
let level;
setGeneralGameSettings();

let leftPressed;
let rightPressed;
let paddleX
let paddleY
let paddleDX;
resetPaddleSettings();

let ballX;
let ballY;
let dx;
let dy;
resetBallSettings();

let numOfVisibleBricks;
let bricks;
resetBrickSettings();

/*
 * Start Screen
 */

function loadHighScores() {
  let phpReadURL = 'js/load_high_scores.php?file=high_scores.txt';
  makeAjaxRequest(phpReadURL, highScoresViaAJAX);
}

function runStartScreen() {
  drawWelcomeMessage();
  addStartScreenListeners();
}

function drawHighScore() {
  let msg = `High Score: ${highScore}`;
  let x = canvasW / 2;
  drawMessageToScreen(msg, x, uiY, center, uiFont, uiTextColour);
}

function drawWelcomeMessage() {
  drawMessageToCenterOfScreen(gameTitle, -20);
  drawMessageToCenterOfScreen(startIntructions, 20);
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
  gameOver = false
  frame = 0;
  addUserInputListeners();
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


function runGameLoop() {
  clearCanvas();
  if (frame < 100) {
    drawMessageToCenterOfScreen(`Level ${level}`, 0);
  }
  drawFrame();
  moveSprites();
  respondToUserInput();
  checkForBrickCollisions();
  checkForBoundaryCollisions();
  checkForPaddleCollision();
  checkForLifeLossConditions();
  checkForNoBricksLeft();
  checkForGameOver();
  if (!gameOver) {
    frame++;
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
        let colour;
        if (r == 1) {
          colour = spriteColour2;
        } else if (r == 2) {
          colour = spriteColour3;
        }
        drawBrick(x, y, colour);
      }
    }
  }
}

function drawBrick(x, y, colour) {
  drawRectangle(x, y, brickW, brickH, colour);
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
            if (r == 0) {
              score += 3;
            } else if (r == 1) {
              score += 2;
            } else if (r == 2) {
              score += 1;
            }
            numOfVisibleBricks -= 1;
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
  resetBallSettings();
}

function checkForNoBricksLeft() {
  if (numOfVisibleBricks == 0) {
    frame = 0;
    resetAfterNoBricksLeft();
  }
}

function resetAfterNoBricksLeft() {
  level += 1;
  resetBallSettings();
  resetBrickSettings();
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
    updateHighScore();
  }
  resetGeneralGameSettings();
  resetPaddleSettings();
  resetBallSettings();
  resetBrickSettings();
}

function updateHighScore() {
  highScore = score;
  highScoresObj.breakout = score;
  let high_scores_str = JSON.stringify(highScoresObj);
  let phpWriteURL = 'js/save_high_scores.php?data=' + high_scores_str;
  makeAjaxRequest(phpWriteURL, highScoresViaAJAX);
}

/*
 * Game Over Screen
 */
function runGameOverScreen() {
  ctx.clearRect(canvasW / 2 - 50, 8, 100, brickH);
  drawHighScore();
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
function highScoresViaAJAX(xhttp) {
  let result = xhttp.responseText;
  highScoresObj = JSON.parse(result);
  highScore = highScoresObj.breakout;
}

function setGeneralGameSettings() {
  gameOver = gameOverStart;
  score = scoreStart;
  highScore = highScoreStart;
  lives = startLives;
  level = 1;
}

function resetGeneralGameSettings() {
  gameOver = gameOverStart;
  score = scoreStart;
  lives = startLives;
  level = 1;
}

function resetPaddleSettings() {
  leftPressed = false;
  rightPressed = false;
  paddleX = startPaddleX
  paddleY = startPaddleY
  paddleDX = startPaddleDX;
}

function resetBallSettings() {
  ballX = generateRandomXStartValue();
  ballY = ballStartY;
  dx = (startDelta + (level / 2));
  dy = -dx;
  dx = dx * generateRandomSign();
}

function resetBrickSettings() {
  numOfVisibleBricks = brickColumnCount * brickRowCount;
  bricks = [];
  createNewBrickArray();
}

function createNewBrickArray() {
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
  generateXYValuesForBricksInArray();
}

function generateXYValuesForBricksInArray() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      let brickX = (c * (brickW + brickPadding)) + brickOffsetLeft + brickCenterShift;
      let brickY = (r * (brickH + brickPadding)) + brickOffsetTop;
      bricks[c][r].x = brickX;
      bricks[c][r].y = brickY;
    }
  }
}

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

function drawRectangle(x, y, w, h, colour) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  if (colour) {
    ctx.fillStyle = colour;
  } else {
    ctx.fillStyle = spriteColour;
  }
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

function makeAjaxRequest(url, callingFunction) {
  let xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callingFunction(this);
    }
  };
  xhttp.open('GET', url, true);
  xhttp.send();
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
      onExit() {
        loadHighScores();
      }
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
