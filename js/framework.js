const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

const gameTitle = 'GAME TITLE';
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

const startDX = 3.0;
const startLives = 3;

// Game Start Settings
let gameOver = true;
let score = 0;
let highScore = 0;
let lives = startLives;

let leftPressed = false;
let rightPressed = false;

let spriteX = canvasW / 2;
let spriteY = canvasH / 2;
let dx = startDX;
let dy = -startDX;

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
  if (!gameOver) {
    clearCanvas();
    respondToUserInput();
    calculateCurrentScore();
    moveSprites();
    drawFrame();
    checkForLifeLossConditions();
    checkForGameOver();
    requestAnimationFrame(runGameLoop);
  }
}

function respondToUserInput() {
  if (rightPressed) {
    spriteX += dx;
  }
  if (leftPressed) {
    spriteX -= dx;
  }
}

function calculateCurrentScore() {
  score += 1;
}

function moveSprites() {
  spriteY += dy;
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
  ctx.beginPath();
  ctx.arc(spriteX, spriteY, 10, 0, 2 * Math.PI);
  ctx.fillStyle = spriteColour;
  ctx.fill();
  ctx.closePath();
}

function checkForLifeLossConditions() {
  if (spriteY < 0) {
    lives -= 1;
    resetAfterLifeLost();
  }
}

function resetAfterLifeLost() {
  leftPressed = false;
  rightPressed = false;
  spriteX = canvasW / 2;
  spriteY = canvasH / 2;
  dx = startDX;
  dy = -startDX;
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
  leftPressed = false;
  rightPressed = false;
  spriteX = canvasW / 2;
  spriteY = canvasH / 2;
  dx = startDX;
  dy = -startDX;
  if (score > highScore) {
    highScore = score;
  }
  score = 0;
  lives = startLives;
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

function transitionStateMachineOnEnter(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step');
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasW, canvasH);
}

/*
 * Start State machine running, and set to ready postion
 */
let gameState = machine.value; // off
gameState = machine.transition(gameState, 'step'); // ready
