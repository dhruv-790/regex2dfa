import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { DfaState } from '@/lib/dfa-types';

export const AutomatonNode = memo(({ data, selected }: NodeProps<DfaState & { isActive?: boolean }>) => {
  const isInitial = data.type === 'initial' || data.type === 'initial_final';
  const isFinal = data.type === 'final' || data.type === 'initial_final';
  const isActive = data.isActive;

  return (
    <div className={cn(
      "relative flex items-center justify-center w-14 sm:w-16 md:w-16 h-14 sm:h-16 md:h-16 rounded-full border-2 transition-all duration-300",
      selected ? "border-secondary scale-110" : "border-primary",
      isActive ? "animate-glow-pulse border-primary ring-4 ring-primary/20 scale-105" : "bg-card/80 backdrop-blur-sm shadow-xl",
      isFinal && "border-double border-4"
    )}>
      {isInitial && (
        <div className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 flex items-center">
          <div className="w-2 sm:w-4 h-0.5 bg-primary" />
          <div className="w-0 h-0 border-t-[3px] sm:border-t-[4px] border-t-transparent border-b-[3px] sm:border-b-[4px] border-b-transparent border-l-[5px] sm:border-l-[6px] border-l-primary" />
        </div>
      )}
      
      <span className={cn(
        "font-headline font-bold text-base sm:text-lg md:text-lg select-none text-center px-1 truncate",
        isActive ? "text-primary" : "text-foreground"
      )}>
        {data.label || data.id}
      </span>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
});

AutomatonNode.displayName = 'AutomatonNode';
