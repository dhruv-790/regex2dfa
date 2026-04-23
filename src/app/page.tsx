"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, Edge, Node, MarkerType } from 'reactflow';
import { DfaEditor } from '@/components/dfa/DfaEditor';
import { DfaGraph } from '@/components/dfa/DfaGraph';
import { SimulatorOverlay } from '@/components/dfa/SimulatorOverlay';
import { DfaState, DfaTransition, ProcessingStep } from '@/lib/dfa-types';
import { generateDfaExplanation } from '@/lib/dfa-engine';
import { convertRegexToDfa } from '@/lib/regex-to-dfa';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Info, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useResponsive } from '@/hooks/use-responsive';

const initialStates: DfaState[] = [
  { id: 'q0', type: 'initial', label: 'Start' },
  { id: 'q1', type: 'normal', label: 'Processing' },
  { id: 'q2', type: 'final', label: 'Accept' },
];

const initialTransitions: DfaTransition[] = [
  { source: 'q0', target: 'q1', symbol: 'a' },
  { source: 'q1', target: 'q2', symbol: 'b' },
  { source: 'q2', target: 'q0', symbol: 'a' },
  { source: 'q1', target: 'q1', symbol: 'a' },
];

const initialNodes: Node[] = [
  { id: 'q0', type: 'automatonNode', position: { x: 100, y: 150 }, data: initialStates[0] },
  { id: 'q1', type: 'automatonNode', position: { x: 300, y: 300 }, data: initialStates[1] },
  { id: 'q2', type: 'automatonNode', position: { x: 500, y: 150 }, data: initialStates[2] },
];

// Helper to group transitions and identify bidirectional paths for curving
function groupTransitionsToEdges(transitions: DfaTransition[]): Edge[] {
  const groups: Record<string, string[]> = {};
  const connectionMap = new Set<string>();
  
  transitions.forEach(t => {
    const key = `${t.source}->${t.target}`;
    if (!groups[key]) groups[key] = [];
    if (!groups[key].includes(t.symbol)) {
      groups[key].push(t.symbol);
    }
    connectionMap.add(key);
  });

  return Object.entries(groups).map(([key, symbols], i) => {
    const [source, target] = key.split('->');
    const isBidirectional = connectionMap.has(`${target}->${source}`) && source !== target;
    
    return {
      id: `e-${key}-${i}`,
      source,
      target,
      label: symbols.sort().join(', '),
      type: 'automatonEdge',
      data: {
        curvature: isBidirectional ? 40 : 0, // Apply curvature if a reverse edge exists
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#26D94C' },
      style: { stroke: '#26D94C', strokeWidth: 2.5 },
    };
  });
}

const initialEdges: Edge[] = groupTransitionsToEdges(initialTransitions);

export default function AutomatonFlowPage() {
  const { toast } = useToast();
  const responsive = useResponsive();
  const [isMounted, setIsMounted] = useState(false);
  const [states, setStates] = useState<DfaState[]>(initialStates);
  const [transitions, setTransitions] = useState<DfaTransition[]>(initialTransitions);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [inputString, setInputString] = useState('ab');
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [simulationAccepted, setSimulationAccepted] = useState<boolean | null>(null);
  const [isEditorDrawerOpen, setIsEditorDrawerOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    const initial = states.find(s => s.type === 'initial' || s.type === 'initial_final');
    if (initial) {
      setCurrentStep({
        currentStateId: initial.id,
        charProcessed: null,
        remainingString: inputString,
        stepIndex: 0,
        path: [initial.id],
      });
      setSimulationAccepted(null);
    }
  }, [states, inputString]);

  useEffect(() => {
    if (isMounted) {
      handleReset();
    }
  }, [isMounted, handleReset]);

  const stepForward = useCallback(() => {
    if (!currentStep || currentStep.remainingString.length === 0) {
      const finalState = states.find(s => s.id === currentStep?.currentStateId);
      if (finalState) {
        setSimulationAccepted(finalState.type === 'final' || finalState.type === 'initial_final');
      }
      setIsPlaying(false);
      return;
    }

    const nextChar = currentStep.remainingString[0];
    const transition = transitions.find(t => t.source === currentStep.currentStateId && t.symbol === nextChar);

    if (transition) {
      const nextStep: ProcessingStep = {
        currentStateId: transition.target,
        charProcessed: nextChar,
        remainingString: currentStep.remainingString.slice(1),
        stepIndex: currentStep.stepIndex + 1,
        path: [...currentStep.path, transition.target],
      };
      setCurrentStep(nextStep);

      if (nextStep.remainingString.length === 0) {
        const lastState = states.find(s => s.id === nextStep.currentStateId);
        setSimulationAccepted(lastState?.type === 'final' || lastState?.type === 'initial_final' || false);
        setIsPlaying(false);
      }
    } else {
      setSimulationAccepted(false);
      setIsPlaying(false);
      toast({
        title: "Rejected",
        description: `No transition found from state ${currentStep.currentStateId} for symbol '${nextChar}'`,
        variant: "destructive"
      });
    }
  }, [currentStep, transitions, states, toast]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        stepForward();
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isPlaying, stepForward]);

  const handleAddState = (state: DfaState) => {
    setStates(prev => [...prev, state]);
    setNodes(prev => [...prev, {
      id: state.id,
      type: 'automatonNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: state,
    }]);
  };

  const handleDeleteState = (id: string) => {
    setStates(prev => prev.filter(s => s.id !== id));
    setNodes(prev => prev.filter(n => n.id !== id));
    setTransitions(prev => {
      const filtered = prev.filter(t => t.source !== id && t.target !== id);
      setEdges(groupTransitionsToEdges(filtered));
      return filtered;
    });
  };

  const handleAddTransition = (transition: DfaTransition) => {
    setTransitions(prev => {
      const updated = [...prev, transition];
      setEdges(groupTransitionsToEdges(updated));
      return updated;
    });
  };

  const handleDeleteTransition = (t: DfaTransition) => {
    setTransitions(prev => {
      const filtered = prev.filter(x => !(x.source === t.source && x.target === t.target && x.symbol === t.symbol));
      setEdges(groupTransitionsToEdges(filtered));
      return filtered;
    });
  };

  const handleRegexConvert = (regex: string) => {
    try {
      const { states: newStates, transitions: newTransitions } = convertRegexToDfa(regex);
      
      setStates(newStates);
      setTransitions(newTransitions);

      // Simple grid-like layout for generated nodes
      const newNodes: Node[] = newStates.map((s, idx) => ({
        id: s.id,
        type: 'automatonNode',
        position: { 
          x: (idx % 3) * 250 + 100, 
          y: Math.floor(idx / 3) * 200 + 100 
        },
        data: s,
      }));

      setNodes(newNodes);
      setEdges(groupTransitionsToEdges(newTransitions));
      
      toast({
        title: "Success",
        description: `Converted regex to ${newStates.length} states.`,
      });
    } catch (e) {
      toast({
        title: "Conversion Failed",
        description: "Invalid regular expression. Ensure you use symbols like a, b, |, *, +, ?.",
        variant: "destructive"
      });
    }
  };

  const handleExplain = () => {
    const result = generateDfaExplanation(states, transitions, inputString);
    setExplanation(result.explanation);
    setIsExplanationOpen(true);
  };

  if (!isMounted) {
    return <div className="h-screen w-screen bg-background" />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-background overflow-hidden">
      <div className="hidden lg:block lg:w-96 overflow-y-auto border-r border-border">
        <DfaEditor 
          states={states}
          transitions={transitions}
          onAddState={handleAddState}
          onAddTransition={handleAddTransition}
          onDeleteState={handleDeleteState}
          onDeleteTransition={handleDeleteTransition}
          onRegexConvert={handleRegexConvert}
        />
      </div>

      <main className="flex-1 relative flex flex-col min-h-0">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between p-2 md:p-4 border-b border-border bg-sidebar/50 backdrop-blur-sm z-10 gap-2">
          <div className="flex items-center gap-2 justify-between lg:justify-start">
            <h1 className="text-lg md:text-2xl font-headline font-bold text-primary tracking-tight">
              DFA Studio
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsEditorDrawerOpen(true)}
              title="Open DFA Editor"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div className="hidden md:flex items-center gap-2 lg:gap-4 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> Start
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Process
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border-2 border-primary" /> Final
            </span>
          </div>
        </header>

        <DfaGraph 
          states={states}
          transitions={transitions}
          currentStep={currentStep}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />

        <SimulatorOverlay 
          inputString={inputString}
          onInputChange={setInputString}
          currentStep={currentStep}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStepForward={stepForward}
          onStepBackward={() => {
            if (currentStep && currentStep.stepIndex > 0) {
              const newPath = [...currentStep.path];
              newPath.pop();
              const prevStepIndex = currentStep.stepIndex - 1;
              setCurrentStep({
                currentStateId: newPath[newPath.length - 1],
                charProcessed: prevStepIndex > 0 ? inputString[prevStepIndex - 1] : null,
                remainingString: inputString.slice(prevStepIndex),
                stepIndex: prevStepIndex,
                path: newPath,
              });
              setSimulationAccepted(null);
            }
          }}
          onReset={handleReset}
          onExplain={handleExplain}
          isAccepted={simulationAccepted}
          isProcessing={false}
        />
      </main>

      <Dialog open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-secondary max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-secondary">
              <Info className="w-6 h-6" />
              Trace Report
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 mt-4 rounded-md border border-border p-4 bg-background/50">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap font-body text-foreground leading-relaxed">
                {explanation}
              </div>
            </div>
          </ScrollArea>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setIsExplanationOpen(false)}
              className="px-4 py-2 rounded-md bg-secondary text-white hover:bg-secondary/90 transition-colors font-bold"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isEditorDrawerOpen} onOpenChange={setIsEditorDrawerOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-sidebar border-r border-border p-0 overflow-y-auto">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="text-primary">DFA Editor</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <DfaEditor 
              states={states}
              transitions={transitions}
              onAddState={handleAddState}
              onAddTransition={handleAddTransition}
              onDeleteState={handleDeleteState}
              onDeleteTransition={handleDeleteTransition}
              onRegexConvert={handleRegexConvert}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
