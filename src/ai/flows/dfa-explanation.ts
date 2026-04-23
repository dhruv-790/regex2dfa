'use server';
/**
 * @fileOverview A Genkit flow for explaining DFA (Deterministic Finite Automaton) behavior.
 *
 * - dfaExplanation - A function that leverages AI to explain why a given input string
 *   is accepted or rejected by a defined DFA, including the sequence of states and transitions.
 * - DfaExplanationInput - The input type for the dfaExplanation function.
 * - DfaExplanationOutput - The return type for the dfaExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define schemas for DFA components
const DfaStateSchema = z.object({
  id: z.string().describe('Unique identifier for the DFA state (e.g., "q0").'),
  type: z.enum(['initial', 'normal', 'final', 'initial_final']).describe('The type of the state (initial, normal, final, or both initial and final).'),
  label: z.string().optional().describe('An optional label for the state.'),
});
export type DfaState = z.infer<typeof DfaStateSchema>;

const DfaTransitionSchema = z.object({
  source: z.string().describe('The ID of the source state.'),
  target: z.string().describe('The ID of the target state.'),
  symbol: z.string().length(1).describe('The single character input symbol that triggers this transition.'),
});
export type DfaTransition = z.infer<typeof DfaTransitionSchema>;

const DfaExplanationInputSchema = z.object({
  states: z.array(DfaStateSchema).describe('An array of all states in the DFA.'),
  transitions: z.array(DfaTransitionSchema).describe('An array of all transitions in the DFA.'),
  inputString: z.string().describe('The input string to be processed by the DFA.'),
});
export type DfaExplanationInput = z.infer<typeof DfaExplanationInputSchema>;

const DfaExplanationOutputSchema = z.object({
  explanation: z.string().describe('A detailed step-by-step explanation of how the DFA processes the input string, including the sequence of states and transitions, and why it is accepted or rejected.'),
  accepted: z.boolean().describe('True if the input string is accepted by the DFA, false otherwise.'),
});
export type DfaExplanationOutput = z.infer<typeof DfaExplanationOutputSchema>;

// Helper function to format DFA states for the prompt
function formatStates(states: DfaState[]): string {
  return states.map(state => {
    let description = `- ${state.id}`;
    if (state.label) {
      description += ` (${state.label})`;
    }
    if (state.type === 'initial') {
      description += ` (Initial)`;
    } else if (state.type === 'final') {
      description += ` (Final)`;
    } else if (state.type === 'initial_final') {
      description += ` (Initial and Final)`;
    }
    return description;
  }).join('\n');
}

// Helper function to format DFA transitions for the prompt
function formatTransitions(transitions: DfaTransition[]): string {
  return transitions.map(t => `- ${t.source} --'${t.symbol}'--> ${t.target}`).join('\n');
}

const explainDfaPrompt = ai.definePrompt({
  name: 'explainDfaPrompt',
  input: { 
    schema: DfaExplanationInputSchema.extend({
      formattedStates: z.string(),
      formattedTransitions: z.string(),
    }) 
  },
  output: { schema: DfaExplanationOutputSchema },
  prompt: `You are an expert in automata theory and discrete mathematics. Your task is to explain the behavior of a given Deterministic Finite Automaton (DFA) when processing a specific input string.

DFA Definition:
States:
{{{formattedStates}}}

Transitions:
{{{formattedTransitions}}}

Input String: "{{{inputString}}}"

Your explanation should:
1.  Start by identifying the initial state.
2.  Trace the processing of the input string character by character.
3.  For each character, clearly state the current state, the character being read, and the next state according to the transitions.
4.  After processing the entire string, state the final state reached.
5.  Conclude whether the input string is "accepted" or "rejected" by the DFA, explaining why (i.e., whether the final state is an accepting state).
6.  The explanation should be clear, concise, and easy for a student to understand.

Please provide your response in the specified JSON format, making sure the 'explanation' field contains the detailed step-by-step trace and conclusion, and the 'accepted' field is a boolean reflecting the final outcome.`,
});

const dfaExplanationFlow = ai.defineFlow(
  {
    name: 'dfaExplanationFlow',
    inputSchema: DfaExplanationInputSchema,
    outputSchema: DfaExplanationOutputSchema,
  },
  async (input) => {
    const formattedStates = formatStates(input.states);
    const formattedTransitions = formatTransitions(input.transitions);

    const { output } = await explainDfaPrompt({
      ...input,
      formattedStates, // Pass formatted strings to the prompt
      formattedTransitions,
    });
    return output!;
  }
);

export async function dfaExplanation(input: DfaExplanationInput): Promise<DfaExplanationOutput> {
  return dfaExplanationFlow(input);
}
