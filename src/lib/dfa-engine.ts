import { DfaState, DfaTransition } from './dfa-types';

/**
 * Deterministically generates a step-by-step explanation of how a DFA processes a string.
 * This replaces the need for an external AI API key.
 */
export function generateDfaExplanation(
  states: DfaState[],
  transitions: DfaTransition[],
  inputString: string
) {
  let currentState = states.find(s => s.type === 'initial' || s.type === 'initial_final');
  
  if (!currentState) {
    return {
      explanation: "Error: No initial state defined in the DFA. Please mark a state as 'Initial'.",
      accepted: false
    };
  }

  let steps: string[] = [];
  steps.push(`Starting at initial state: **${currentState.id}**${currentState.label ? ` (${currentState.label})` : ''}.`);

  let tempState = currentState;
  let isHalted = false;

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const transition = transitions.find(t => t.source === tempState.id && t.symbol === char);

    if (!transition) {
      steps.push(`Step ${i + 1}: Reading symbol '${char}'. No transition found from state **${tempState.id}**. Processing halted.`);
      isHalted = true;
      break;
    }

    const nextState = states.find(s => s.id === transition.target);
    if (!nextState) {
      steps.push(`Step ${i + 1}: Reading symbol '${char}'. Transition leads to a non-existent state **${transition.target}**.`);
      isHalted = true;
      break;
    }

    steps.push(`Step ${i + 1}: Reading symbol '${char}'. Transitioning from **${tempState.id}** to **${nextState.id}**.`);
    tempState = nextState;
  }

  const isAccepted = !isHalted && (tempState.type === 'final' || tempState.type === 'initial_final');
  
  steps.push(`\nFinal state reached: **${tempState.id}**.`);
  if (isAccepted) {
    steps.push(`\nConclusion: The string is **ACCEPTED** because state **${tempState.id}** is a final/accepting state.`);
  } else {
    steps.push(`\nConclusion: The string is **REJECTED** because ${isHalted ? 'the machine halted unexpectedly' : `state **${tempState.id}** is not an accepting state`}.`);
  }

  return {
    explanation: steps.join('\n'),
    accepted: isAccepted
  };
}
