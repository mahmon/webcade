const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

const gameTitle = 'BREAKOUT';
const startIntructions = 'Hit Enter to play'
const gameRunning = 'this is game running';
const gameOverTitle = 'GAME OVER';
const replayIntructions = 'Hit Enter to play again'

const spriteColor = '#dd1111';
const textColor = '#dddddd';

let gameOver = false;
let rightPressed = false;

let ballRadius = 10;
let randBallX = (Math.floor(Math.random() * (canvasW - 4 * ballRadius))) + ballRadius;
let randDX = Math.round(Math.random()) * 2 - 1;
// let ballX = randBallX;
// let ballY = canvasH + 2 * ballRadius;
let ballX = 50;
let ballY = 50;
let ballLeftEdge = ballX - ballRadius;
let ballRightEdge = ballX + ballRadius;
let ballTopEdge = ballY - ballRadius;
let ballBottomEdge = ballY + ballRadius;
let dx = 4.0 * randDX;
let dy = -dx;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = false;
  }
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
      const destinationState = destinationTransition.target
      const destinationStateDefinition = stateMachineDefinition[destinationState]
      currentStateDefinition.actions.onExit();
      destinationStateDefinition.actions.onEnter();
      machine.value = destinationState;
      return machine.value
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
        drawMessageToScreen(gameTitle, -10);
        drawMessageToScreen(startIntructions, 10);
        document.addEventListener('keydown', listenForStartGame, true);
      },
      onExit() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        document.removeEventListener('keydown', listenForStartGame, true);
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
        document.addEventListener('keydown', listenForPlayerInput, true);
        drawGame();
      },
      onExit() {
        document.removeEventListener('keydown', listenForPlayerInput, true);
        ctx.clearRect(0, 0, canvasW, canvasH);
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
        drawMessageToScreen(gameOverTitle, -10);
        drawMessageToScreen(replayIntructions, 10);
        document.addEventListener('keydown', listenForReplayGame, true);
      },
      onExit() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        document.removeEventListener('keydown', listenForReplayGame, true);
      }
    },
    transitions: {
      step: {
        target: 'ready',
      }
    }
  }
});

function listenForStartGame(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step'); // gameRunning
  }
}

function listenForPlayerInput(e) {
  // todo ending game on right arrow for testing
  if (e.key == ' ') {
    gameState = machine.transition(gameState, 'step'); // gameOver
  }
}

function listenForReplayGame(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step'); // ready
  }
}

function drawMessageToScreen(msg, shiftY) {
  let x = canvasW / 2;
  let y = (canvasH / 2) + shiftY;
  ctx.textAlign = 'center';
  ctx.font = '12px Arial';
  ctx.fillStyle = textColor;
  ctx.fillText(msg, x, y);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
  ctx.fillStyle = spriteColor;
  ctx.fill();
  ctx.closePath();
}

function drawGame() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawBall();
  //requestAnimationFrame(drawGame);
}

let gameState = machine.value; // off
gameState = machine.transition(gameState, 'step'); // ready
