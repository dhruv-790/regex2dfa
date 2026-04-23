import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge, 
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AutomatonNode } from './AutomatonNode';
import { AutomatonEdge } from './AutomatonEdge';
import { DfaState, DfaTransition, ProcessingStep } from '@/lib/dfa-types';

const nodeTypes = {
  automatonNode: AutomatonNode,
};

const edgeTypes = {
  automatonEdge: AutomatonEdge,
};

interface DfaGraphProps {
  states: DfaState[];
  transitions: DfaTransition[];
  currentStep: ProcessingStep | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  nodes: Node[];
  edges: Edge[];
}

export function DfaGraph({ states, currentStep, nodes, edges, onNodesChange, onEdgesChange }: DfaGraphProps) {
  const activeStateId = currentStep?.currentStateId || null;
  const lastSourceId = currentStep && currentStep.path.length > 1 
    ? currentStep.path[currentStep.path.length - 2] 
    : null;
  const lastChar = currentStep?.charProcessed;

  const rfNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: node.id === activeStateId,
      }
    }));
  }, [nodes, activeStateId]);

  const rfEdges = useMemo(() => {
    return edges.map(edge => {
      // Determine if this specific edge was just traversed
      // Since labels can be "a, b", we check if the last processed char is in the label
      const isActiveTransition = 
        lastSourceId === edge.source && 
        activeStateId === edge.target && 
        lastChar !== null && 
        typeof edge.label === 'string' && 
        edge.label.split(', ').includes(lastChar!);

      return {
        ...edge,
        animated: isActiveTransition,
        className: isActiveTransition ? 'active-glow' : '',
      };
    });
  }, [edges, activeStateId, lastSourceId, lastChar]);

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#26D94C" gap={20} style={{ opacity: 0.05 }} />
        <Controls className="fill-primary [&>button]:touch-friendly [&>button]:min-h-10 [&>button]:min-w-10" />
        <div className="hidden md:block">
          <MiniMap 
            nodeColor={(n) => n.data?.isActive ? '#26D94C' : '#BA4CFF'} 
            maskColor="rgba(31, 46, 33, 0.8)"
            className="bg-sidebar border border-border"
          />
        </div>
      </ReactFlow>
    </div>
  );
}
