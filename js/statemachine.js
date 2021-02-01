// const canvas = document.getElementById('gameCanvas');
// const ctx = canvas.getContext('2d');
// const canvasW = canvas.width;
// const canvasH = canvas.height;


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
      destinationTransition.action();
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
      onEnter() {
        console.log('off: onEnter. Called when the machine ENTERs the OFF state ');
      },
      onExit() {
        console.log('off: onExit. Called when the machine EXITSs the OFF state ');
      }
    },
    transitions: {
      switch: {
        target: 'on',
        action() {
          console.log('called "transition action" for "switch" in "off" state');
        }
      }
    }
  },
  on: {
    actions: {
      onEnter() {
        console.log('on: onEnter. Called when the machine ENTERs the ON state ');
      },
      onExit() {
        console.log('on: onExit. Called when the machine EXITSs the ON state ');
      }
    },
    transitions: {
      switch: {
        target: 'off',
        action() {
          console.log('transition action for "switch" in "on" state');
        }
      }
    }
  }
});

let state = machine.value;
console.log(`current state: ${state}`); // off

state = machine.transition(state, 'switch');
console.log(`current state: ${state}`); // on

state = machine.transition(state, 'switch');
console.log(`current state: ${state}`); // off

// https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript

// A transition can define actions that occur when the transition happens. Actions will typically have side effects.
// Also, "When an event happens:"
//
// The event is checked against the current state’s transitions.
// If a transition matches the event, that transition “happens”.
// By virtue of a transition “happening”, states are exited, and entered and the relevant actions are performed
// The machine immediately is in the new state, ready to process the next event.
