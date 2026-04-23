import { DfaState, DfaTransition } from './dfa-types';

/**
 * Converts a regular expression to a DFA using Thompson's construction and Subset construction.
 * Supports: |, *, +, ?, ( ), and literals.
 */

class NFAState {
  id: number;
  transitions: Map<string, NFAState[]>;
  isFinal: boolean;

  constructor(id: number) {
    this.id = id;
    this.transitions = new Map();
    this.isFinal = false;
  }

  addTransition(symbol: string, state: NFAState) {
    const list = this.transitions.get(symbol) || [];
    list.push(state);
    this.transitions.set(symbol, list);
  }
}

class NFA {
  start: NFAState;
  end: NFAState;

  constructor(start: NFAState, end: NFAState) {
    this.start = start;
    this.end = end;
  }
}

export function convertRegexToDfa(regex: string): { states: DfaState[], transitions: DfaTransition[] } {
  if (!regex) return { states: [], transitions: [] };

  try {
    const postfix = regexToPostfix(preprocessRegex(regex));
    const nfa = buildNFA(postfix);
    const dfa = nfaToDfa(nfa);
    return dfa;
  } catch (e) {
    console.error("Regex conversion error:", e);
    throw e;
  }
}

function preprocessRegex(regex: string): string {
  let res = "";
  for (let i = 0; i < regex.length; i++) {
    const c1 = regex[i];
    res += c1;
    if (i + 1 < regex.length) {
      const c2 = regex[i + 1];
      if (
        (isLiteral(c1) || c1 === ')' || c1 === '*' || c1 === '+' || c1 === '?') &&
        (isLiteral(c2) || c2 === '(')
      ) {
        res += '.'; // Explicit concatenation
      }
    }
  }
  return res;
}

function isLiteral(c: string): boolean {
  return /[a-zA-Z0-9]/.test(c);
}

function regexToPostfix(exp: string): string {
  const precedence: Record<string, number> = { '*': 3, '+': 3, '?': 3, '.': 2, '|': 1 };
  let output = "";
  const stack: string[] = [];

  for (const char of exp) {
    if (isLiteral(char)) {
      output += char;
    } else if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output += stack.pop();
      }
      stack.pop();
    } else {
      while (stack.length && precedence[stack[stack.length - 1]] >= precedence[char]) {
        output += stack.pop();
      }
      stack.push(char);
    }
  }
  while (stack.length) output += stack.pop();
  return output;
}

let stateCounter = 0;
function createState() {
  return new NFAState(stateCounter++);
}

function buildNFA(postfix: string): NFA {
  stateCounter = 0;
  const stack: NFA[] = [];

  for (const char of postfix) {
    if (isLiteral(char)) {
      const s1 = createState();
      const s2 = createState();
      s1.addTransition(char, s2);
      stack.push(new NFA(s1, s2));
    } else if (char === '.') {
      const n2 = stack.pop()!;
      const n1 = stack.pop()!;
      n1.end.addTransition('ε', n2.start);
      stack.push(new NFA(n1.start, n2.end));
    } else if (char === '|') {
      const n2 = stack.pop()!;
      const n1 = stack.pop()!;
      const start = createState();
      const end = createState();
      start.addTransition('ε', n1.start);
      start.addTransition('ε', n2.start);
      n1.end.addTransition('ε', end);
      n2.end.addTransition('ε', end);
      stack.push(new NFA(start, end));
    } else if (char === '*') {
      const n = stack.pop()!;
      const start = createState();
      const end = createState();
      start.addTransition('ε', n.start);
      start.addTransition('ε', end);
      n.end.addTransition('ε', n.start);
      n.end.addTransition('ε', end);
      stack.push(new NFA(start, end));
    } else if (char === '+') {
      const n = stack.pop()!;
      const start = createState();
      const end = createState();
      start.addTransition('ε', n.start);
      n.end.addTransition('ε', n.start);
      n.end.addTransition('ε', end);
      stack.push(new NFA(start, end));
    } else if (char === '?') {
      const n = stack.pop()!;
      const start = createState();
      const end = createState();
      start.addTransition('ε', n.start);
      start.addTransition('ε', end);
      n.end.addTransition('ε', end);
      stack.push(new NFA(start, end));
    }
  }
  const result = stack.pop()!;
  result.end.isFinal = true;
  return result;
}

function epsilonClosure(states: NFAState[]): NFAState[] {
  const closure = [...states];
  const stack = [...states];
  while (stack.length) {
    const s = stack.pop()!;
    const epsTransitions = s.transitions.get('ε') || [];
    for (const next of epsTransitions) {
      if (!closure.find(st => st.id === next.id)) {
        closure.push(next);
        stack.push(next);
      }
    }
  }
  return closure;
}

function move(states: NFAState[], symbol: string): NFAState[] {
  const result: NFAState[] = [];
  for (const s of states) {
    const transitions = s.transitions.get(symbol) || [];
    for (const next of transitions) {
      if (!result.find(st => st.id === next.id)) {
        result.push(next);
      }
    }
  }
  return result;
}

function nfaToDfa(nfa: NFA): { states: DfaState[], transitions: DfaTransition[] } {
  const alphabet = new Set<string>();
  const getAllSymbols = (s: NFAState, visited: Set<number>) => {
    if (visited.has(s.id)) return;
    visited.add(s.id);
    for (const [sym, nexts] of s.transitions) {
      if (sym !== 'ε') alphabet.add(sym);
      for (const next of nexts) getAllSymbols(next, visited);
    }
  };
  getAllSymbols(nfa.start, new Set());

  const startClosure = epsilonClosure([nfa.start]);
  const dfaStatesSets: NFAState[][] = [startClosure];
  const transitions: DfaTransition[] = [];
  
  const getSetName = (set: NFAState[]) => {
    return "q" + dfaStatesSets.findIndex(s => 
      s.length === set.length && s.every(st => set.find(x => x.id === st.id))
    );
  };

  let i = 0;
  while (i < dfaStatesSets.length) {
    const currentSet = dfaStatesSets[i];
    const sourceName = "q" + i;

    for (const symbol of alphabet) {
      const moved = move(currentSet, symbol);
      if (moved.length === 0) continue;
      
      const closure = epsilonClosure(moved);
      let existingIndex = dfaStatesSets.findIndex(s => 
        s.length === closure.length && s.every(st => closure.find(x => x.id === st.id))
      );

      if (existingIndex === -1) {
        existingIndex = dfaStatesSets.length;
        dfaStatesSets.push(closure);
      }

      transitions.push({
        source: sourceName,
        target: "q" + existingIndex,
        symbol
      });
    }
    i++;
  }

  const states: DfaState[] = dfaStatesSets.map((set, idx) => {
    const id = "q" + idx;
    const isInitial = idx === 0;
    const isFinal = set.some(s => s.isFinal);
    
    let type: DfaState['type'] = 'normal';
    if (isInitial && isFinal) type = 'initial_final';
    else if (isInitial) type = 'initial';
    else if (isFinal) type = 'final';

    return { id, type, label: id === "q0" ? "Start" : id };
  });

  return { states, transitions };
}
