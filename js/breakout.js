const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

const gameTitle = 'BREAKOUT';
const gameOverTitle = 'GAME OVER';
const startIntructions = 'Press Enter to play';
const replayIntructions = 'Press Enter to play again';

const spriteColor = '#dd1111';
const textColor = '#dddddd';
const startDX = 2.0;

let ballRadius = 10;
let randX = (Math.floor(Math.random() * (canvasW - 4 * ballRadius))) + ballRadius;
let randSign = Math.round(Math.random()) * 2 - 1;
let ballX = randX;
let ballY = canvasH - ballRadius;
let ballTopEdge = ballY - ballRadius;
let ballRightEdge = ballX + ballRadius;
let ballBottomEdge = ballY + ballRadius;
let ballLeftEdge = ballX - ballRadius;
let dx = startDX * randSign;
let dy = -startDX;

let paddleW = 80;
let paddleH = 10;
let paddleX = (canvasW - paddleW) / 2;
let paddleY = canvasH - paddleH;

let gameOver = true;

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
        stopStartScreen();
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
        gameOver = false;
        runGameLoop();
      },
      onExit() {
        gameOver = true;
        resetBall();
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
        stopGameOverScreen();
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
 * Helper methods
 */
function transitionStateMachineOnEnter(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step');
  }
}

function drawMessageToScreen(msg, shiftY) {
  let x = canvasW / 2;
  let y = (canvasH / 2) + shiftY;
  ctx.textAlign = 'center';
  ctx.font = '24px Arial';
  ctx.fillStyle = textColor;
  ctx.fillText(msg, x, y);
}

/*
 * Start Screen
 */
function runStartScreen() {
  drawMessageToScreen(gameTitle, -20);
  drawMessageToScreen(startIntructions, 20);
  document.addEventListener('keydown', transitionStateMachineOnEnter, true);
}

function stopStartScreen() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

/*
 * Game Loop
 */

function movePaddle(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    console.log('right paddle');
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    console.log('left paddle');
  }
}



function resetBall() {
  randX = (Math.floor(Math.random() * (canvasW - 4 * ballRadius))) + ballRadius;
  randSign = Math.round(Math.random()) * 2 - 1;
  ballX = randX;
  ballY = canvasH - ballRadius;
  ballTopEdge = ballY - ballRadius;
  ballRightEdge = ballX + ballRadius;
  ballBottomEdge = ballY + ballRadius;
  ballLeftEdge = ballX - ballRadius;
  dx = startDX * randSign;
  dy = -startDX;
}

function drawBall() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, 2 * Math.PI);
  ctx.fillStyle = spriteColor;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, paddleY, paddleW, paddleH);
  ctx.fillStyle = spriteColor;
  ctx.fill();
  ctx.closePath();
}

function moveBall() {
  ballX += dx;
  ballY += dy;
  ballTopEdge = ballY - ballRadius;
  ballRightEdge = ballX + ballRadius;
  ballBottomEdge = ballY + ballRadius;
  ballLeftEdge = ballX - ballRadius;
}

function movePaddle() {
  //
}

function checkForBoundaryCollision() {
  if (ballRightEdge >= canvasW || ballLeftEdge <= 0) {
    dx = -dx;
  } else if (ballTopEdge <= 0) {
    dy = -dy;
  } else if (ballBottomEdge >= canvasH) {
    gameOver = true;
    gameState = machine.transition(gameState, 'step');
  }
}

function runGameLoop() {
  drawBall();
  drawPaddle();
  moveBall();
  movePaddle();
  checkForBoundaryCollision();
  if (!gameOver) {
    requestAnimationFrame(runGameLoop);
  }
}

/*
 * Game Over Screen
 */
function runGameOverScreen() {
  drawMessageToScreen(gameOverTitle, -20);
  drawMessageToScreen(replayIntructions, 20);
  document.addEventListener('keydown', transitionStateMachineOnEnter, true);
}

function stopGameOverScreen() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

/*
 * Start State machine running, and set to ready postion
 */
let gameState = machine.value; // off
gameState = machine.transition(gameState, 'step'); // ready
