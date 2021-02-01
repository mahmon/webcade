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

let gameRunning = 'this is game running';

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

/*
 * State machine API
 */
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
        console.log('gameRunning: onEnter');
        drawMessageToScreen('game is running', -10);
        drawMessageToScreen('hit enter to simulate losing', 10);
        document.addEventListener('keydown', transitionStateMachineOnEnter, true);
      },
      onExit() {
        console.log('gameRunning: onExit');
        ctx.clearRect(0, 0, canvasW, canvasH);
        document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
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

function transitionStateMachineOnEnter(e) {
  if (e.key == 'Enter') {
    gameState = machine.transition(gameState, 'step');
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

function runStartScreen() {
  drawMessageToScreen(gameTitle, -10);
  drawMessageToScreen(startIntructions, 10);
  document.addEventListener('keydown', transitionStateMachineOnEnter, true);
}

function stopStartScreen() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  document.removeEventListener('keydown', transitionStateMachineOnEnter, true);
}

function runGameOverScreen() {
  drawMessageToScreen(gameOverTitle, -10);
  drawMessageToScreen(replayIntructions, 10);
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
