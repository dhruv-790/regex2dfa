# **App Name**: Automaton Flow

## Core Features:

- DFA Definition & Editing: Users can create, edit, and visualize DFA states and transitions using a drag-and-drop interface powered by React Flow. This includes defining initial and final states.
- Input String Tester: Provide a field to input custom strings to test the defined DFA. The app will simulate the DFA processing this string.
- Step-by-Step Animation Controls: Allow users to play, pause, step forward, and step backward through the DFA's processing of an input string.
- Live String & Path Display: As the DFA animates, dynamically display the remaining input string and a clear visualization of the character path taken so far.
- Active Node Highlighting: During animation, the currently active state node will glow to clearly indicate the DFA's position.
- DFA Explanation Tool: Leverage a generative AI tool to provide clear explanations of why a specific input string is accepted or rejected by the current DFA configuration, detailing the sequence of states and transitions.

## Style Guidelines:

- The visual theme is dark, suggesting a serious, computational focus appropriate for an educational tool. The background is a very dark, slightly desaturated green: #1F2E21. This provides a deep, calming base.
- The primary interaction color, used for active elements, highlights, and borders, is a vibrant green: #26D94C. This evokes a 'system online' feel, indicating functionality and activity.
- A vibrant purple (#BA4CFF) serves as an accent color for key interactive elements or alternative highlights, creating strong contrast against the green and dark background, as requested by the user.
- Headline font: 'Space Grotesk' (sans-serif) for its modern, technical aesthetic, fitting the computational nature of DFAs. Body text font: 'Inter' (sans-serif) for its readability and neutrality in educational contexts.
- Clean, line-based vector icons for navigation, controls (play, pause, step), and state indicators, ensuring clarity and consistency within the dark, technical interface.
- A split-panel layout will dedicate significant space to the React Flow-based DFA graph visualization, with dedicated areas for input string entry, animation controls, and output/explanation displays. Elements are well-spaced for readability and ease of interaction.
- Subtle, smooth animations for node glowing and state transitions. Transitions between steps will be fluid, providing clear visual feedback without being distracting. The glow effect will use a soft pulsation.