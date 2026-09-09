import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Loader2, Dumbbell, AlertCircle } from 'lucide-react';
import { lightTheme } from '../themeStyles';

interface ExerciseGifDisplayProps {
  name: string;
  className?: string;
  containerClassName?: string;
}

export const ExerciseGifDisplay: React.FC<ExerciseGifDisplayProps> = ({
  name,
  className = "w-full h-auto object-cover rounded-[15px] block",
  containerClassName = "relative overflow-hidden rounded-[24px] shadow-sm border border-black/5 min-h-[240px] flex items-center justify-center"
}) => {
  const sources = useMemo(() => getExerciseGifSources(name), [name]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [name, sources]);

  const currentSrc = sources[sourceIndex] || '';

  const handleError = useCallback(() => {
    console.warn(`[IronLog Media] Failed to load GIF for "${name}" from source [${sourceIndex}]: ${currentSrc}`);
    
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex(prev => prev + 1);
      setIsLoading(true);
    } else if (retryCount < 1) {
      // Retry once after 800ms
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setSourceIndex(0);
        setIsLoading(true);
      }, 800);
    } else {
      console.error(`[IronLog Media] All sources exhausted for "${name}". Rendering visual fallback card.`);
      setIsLoading(false);
      setHasError(true);
    }
  }, [name, sourceIndex, sources, currentSrc, retryCount]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const muscleGroup = getMuscleGroup(name);
  const muscleDisplay = getMuscleGroupDisplay(muscleGroup);

  return (
    <div style={{ backgroundColor: lightTheme.card }} className={containerClassName}>
      {isLoading && (
        <div 
          style={{ backgroundColor: lightTheme.card }} 
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
        >
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-[11px] font-black uppercase tracking-widest text-black">動作準備中...</p>
        </div>
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/25 flex items-center justify-center text-slate-900 border border-[#82CC00]/30 shadow-sm">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900">{name}</h4>
            <span className="text-xs font-bold text-slate-500 mt-1 inline-block">
              {muscleDisplay.cn} · {muscleDisplay.en}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 max-w-[240px] leading-relaxed">
            請參閱下方「運動方法」指引以獲取標準發力與操作要領
          </p>
        </div>
      ) : currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={name}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ) : null}
    </div>
  );
};
