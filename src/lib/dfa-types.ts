export interface DfaState {
  id: string;
  type: 'initial' | 'normal' | 'final' | 'initial_final';
  label?: string;
}

export interface DfaTransition {
  source: string;
  target: string;
  symbol: string;
}

export interface DfaDefinition {
  states: DfaState[];
  transitions: DfaTransition[];
}

export interface ProcessingStep {
  currentStateId: string;
  charProcessed: string | null;
  remainingString: string;
  stepIndex: number;
  path: string[]; // State IDs visited
}
