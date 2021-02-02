const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasW = canvas.width;
const canvasH = canvas.height;

const gameTitle = 'GAME TITLE';
const gameOverTitle = 'GAME OVER';
const startIntructions = 'Press Enter to play';
const replayIntructions = 'Press Enter to play again';

const spriteColor = '#dd1111';
const textColor = '#dddddd';
const startDX = 1.0;

let gameOver = true;

// sprite start data
let spriteX = canvasW / 2;
let spriteY = canvasH / 2;
let dx = startDX;
let dy = -dx;

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
        resetGame();
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
  drawMessageToCenterOfScreen(gameTitle, -20);
  drawMessageToCenterOfScreen(startIntructions, 20);
  addStartScreenListeners();
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
  addUserInputListeners();
  runGameLoop();
}

function runGameLoop() {
  console.log('draw the game');
}

function addUserInputListeners() {
  document.addEventListener('keydown', transitionStateMachineOnEnter, true);
}

function removeUserInputListeners() {
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

function resetGame() {
  removeUserInputListeners();
  clearCanvas();
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

function removeGameOverScreenListeners() {
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

function clearGameOverScreen() {
  removeGameOverScreenListeners();
  clearCanvas();
}

/*
 * Helper methods
 */
function clearCanvas() {
  ctx.clearRect(0, 0, canvasW, canvasH);
}

function drawMessageToCenterOfScreen(msg, shiftY) {
  let x = canvasW / 2;
  let y = (canvasH / 2) + shiftY;
  ctx.textAlign = 'center';
  ctx.font = '24px Arial';
  ctx.fillStyle = textColor;
  ctx.fillText(msg, x, y);
}

function transitionStateMachineOnEnter(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step');
  }
}

/*
 * Start State machine running, and set to ready postion
 */
let gameState = machine.value; // off
gameState = machine.transition(gameState, 'step'); // ready
