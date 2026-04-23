import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingStep } from '@/lib/dfa-types';

interface SimulatorOverlayProps {
  inputString: string;
  onInputChange: (val: string) => void;
  currentStep: ProcessingStep | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onExplain: () => void;
  isAccepted: boolean | null;
  isProcessing: boolean;
}

export function SimulatorOverlay({
  inputString,
  onInputChange,
  currentStep,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onExplain,
  isAccepted,
  isProcessing
}: SimulatorOverlayProps) {
  const pathString = currentStep?.path.join(' → ') || 'No path';
  const remaining = currentStep?.remainingString || inputString;

  return (
    <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-2 md:px-4 pointer-events-none">
      <Card className="pointer-events-auto bg-sidebar/95 backdrop-blur-md border-primary/30 shadow-2xl overflow-hidden">
        <CardContent className="p-3 md:p-6 space-y-2 md:space-y-4">
          <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center">
            <div className="flex-1 w-full relative">
              <Input
                placeholder="Enter test string"
                value={inputString}
                onChange={(e) => onInputChange(e.target.value)}
                className="bg-background border-border text-sm md:text-lg font-code pr-20 md:pr-24"
              />
              <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:gap-1">
                {isAccepted === true && (
                  <div className="flex items-center text-primary text-[10px] md:text-xs font-bold bg-primary/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-primary/20">
                    <CheckCircle2 className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1" /> ACC
                  </div>
                )}
                {isAccepted === false && (
                  <div className="flex items-center text-destructive text-[10px] md:text-xs font-bold bg-destructive/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-destructive/20">
                    <AlertCircle className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1" /> REJ
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="outline" size="sm" onClick={onReset} title="Reset Simulation" className="border-border hover:text-primary min-h-11 sm:h-8 md:h-10 min-w-11 sm:w-8 md:w-10 p-0 md:p-1 touch-friendly">
                <RefreshCw className="w-3 md:w-4 h-3 md:h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onStepBackward} disabled={!currentStep || currentStep.stepIndex === 0} title="Step Backward" className="border-border hover:text-primary min-h-11 sm:h-8 md:h-10 min-w-11 sm:w-8 md:w-10 p-0 md:p-1 touch-friendly">
                <SkipBack className="w-3 md:w-4 h-3 md:h-4" />
              </Button>
              <Button 
                variant={isPlaying ? "destructive" : "default"} 
                size="sm" 
                onClick={onTogglePlay}
                title={isPlaying ? "Pause" : "Play"}
                className={cn(!isPlaying && "bg-primary text-primary-foreground hover:bg-primary/90", "min-h-11 sm:h-8 md:h-10 min-w-11 sm:w-8 md:w-10 p-0 md:p-1 touch-friendly")}
              >
                {isPlaying ? <Pause className="w-3 md:w-4 h-3 md:h-4" /> : <Play className="w-3 md:w-4 h-3 md:h-4 ml-0.5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={onStepForward} disabled={remaining.length === 0} title="Step Forward" className="border-border hover:text-primary min-h-11 sm:h-8 md:h-10 min-w-11 sm:w-8 md:w-10 p-0 md:p-1 touch-friendly">
                <SkipForward className="w-3 md:w-4 h-3 md:h-4" />
              </Button>
              <Button 
                onClick={onExplain} 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xs md:text-sm min-h-11 md:min-h-10 px-3 md:px-3 py-2 md:py-2 touch-friendly"
                disabled={isProcessing}
              >
                <Info className="w-3 md:w-4 h-3 md:h-4 mr-1" /> <span className="hidden md:inline">Trace Report</span><span className="md:hidden">Info</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pt-1 md:pt-2">
            <div className="bg-background/50 rounded-lg p-2 md:p-3 border border-border/50">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold block mb-0.5 md:mb-1">String Progress</span>
              <div className="font-code text-sm md:text-xl tracking-widest flex items-center">
                <span className="text-primary opacity-50">{inputString.slice(0, currentStep?.stepIndex || 0)}</span>
                <span className="text-primary underline decoration-2 underline-offset-4 animate-pulse">{inputString[currentStep?.stepIndex || 0] || ''}</span>
                <span className="text-foreground">{inputString.slice((currentStep?.stepIndex || 0) + 1)}</span>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-2 md:p-3 border border-border/50 hidden md:block">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold block mb-0.5 md:mb-1">State Path</span>
              <div className="font-code text-xs md:text-sm truncate text-secondary">
                {pathString}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
