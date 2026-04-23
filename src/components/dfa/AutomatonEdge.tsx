import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, getSimpleBezierPath } from 'reactflow';
import { cn } from '@/lib/utils';

interface AutomatonEdgeData {
  curvature?: number;
}

type AutomatonEdgeProps = EdgeProps & {
  data?: AutomatonEdgeData;
  className?: string;
};

export function AutomatonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  animated,
  className,
  data,
}: AutomatonEdgeProps) {
  const isSelfLoop = sourceX === targetX && sourceY === targetY;
  const curvature = data?.curvature || 0;
  
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (isSelfLoop) {
    // Enhanced self-loop path: a larger, cleaner teardrop shape
    const radius = 40;
    const x = sourceX;
    const y = sourceY - 32; // Offset from node center
    edgePath = `M ${x} ${sourceY} C ${x - radius} ${y - radius} ${x + radius} ${y - radius} ${x} ${sourceY}`;
    labelX = x;
    labelY = y - radius + 10;
  } else if (curvature !== 0) {
    // Bidirectional edges: use a quadratic curve to avoid overlapping the reverse edge
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    // Calculate perpendicular vector for offset
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    
    const controlX = midX + nx * curvature;
    const controlY = midY + ny * curvature;
    
    edgePath = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    labelX = midX + nx * (curvature * 1.2);
    labelY = midY + ny * (curvature * 1.2);
  } else {
    // Normal straight-ish bezier path
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetPosition,
      targetX,
      targetY,
    });
  }

  return (
    <>
      <path
        id={id}
        style={style}
        className={cn("react-flow__edge-path fill-none transition-all duration-300", className)}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              "px-2 py-1 rounded-full border bg-background/95 shadow-md transition-all duration-300 backdrop-blur-sm",
              animated ? "border-primary text-primary scale-110 ring-4 ring-primary/20" : "border-border text-foreground"
            )}
          >
            <span className="font-code font-bold text-sm tracking-wider">
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
