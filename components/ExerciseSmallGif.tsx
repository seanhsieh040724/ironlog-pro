import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay, getExercisePosterUrl, isMp4Exercise } from '../utils/fitnessMath';
import { Loader2, Dumbbell } from 'lucide-react';

interface ExerciseSmallGifProps {
  name: string;
}

export const ExerciseSmallGif: React.FC<ExerciseSmallGifProps> = ({ name }) => {
  const cleanName = (name || '').trim();
  const isMp4 = isMp4Exercise(cleanName);
  const posterUrl = getExercisePosterUrl(cleanName);

  // For MP4 exercises (Chest, Back, Shoulders, Legs, Arms & Core): Dedicated static poster thumbnail
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterFailed, setPosterFailed] = useState(false);

  // For non-MP4 exercises: GIF cascade state
  const sources = useMemo(() => {
    if (isMp4) return [];
    return getExerciseGifSources(cleanName);
  }, [cleanName, isMp4]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [gifLoading, setGifLoading] = useState(true);
  const [gifFailedAll, setGifFailedAll] = useState(false);

  useEffect(() => {
    setPosterLoading(true);
    setPosterFailed(false);
    setSourceIndex(0);
    setGifLoading(true);
    setGifFailedAll(false);
  }, [cleanName]);

  const handleGifError = useCallback(() => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex(prev => prev + 1);
    } else {
      setGifLoading(false);
      setGifFailedAll(true);
    }
  }, [sourceIndex, sources.length]);

  const handleGifLoad = useCallback(() => {
    setGifLoading(false);
    setGifFailedAll(false);
  }, []);

  // 1. MP4 Exercises (Chest, Back, Shoulders, Legs, Arms & Core): STRICTLY use dedicated static poster, NEVER fallback to GIF
  if (isMp4) {
    if (posterFailed || !posterUrl) {
      const mg = getMuscleGroup(cleanName);
      const disp = getMuscleGroupDisplay(mg);
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-700 p-1 text-center select-none">
          <Dumbbell className="w-4 h-4 text-slate-600 mb-0.5" />
          <span className="text-[9px] font-black leading-tight line-clamp-1">{disp.cn}</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative overflow-hidden bg-slate-50 flex items-center justify-center">
        {posterLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
          </div>
        )}
        <img
          src={posterUrl}
          alt={cleanName}
          className="w-full h-full object-cover select-none block"
          onLoad={() => setPosterLoading(false)}
          onError={() => {
            console.warn(`[IronLog SmallMedia] Failed to load poster for MP4 chest exercise "${cleanName}".`);
            setPosterLoading(false);
            setPosterFailed(true);
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Non-MP4 Exercises: Standard GIF cascade
  if (gifFailedAll) {
    const mg = getMuscleGroup(cleanName);
    const disp = getMuscleGroupDisplay(mg);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-700 p-1 text-center select-none">
        <Dumbbell className="w-4 h-4 text-slate-600 mb-0.5" />
        <span className="text-[9px] font-black leading-tight line-clamp-1">{disp.cn}</span>
      </div>
    );
  }

  const currentSrc = sources[sourceIndex] || '';

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 flex items-center justify-center">
      {gifLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        </div>
      )}

      {currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={cleanName}
          className="w-full h-full object-cover"
          onLoad={handleGifLoad}
          onError={handleGifError}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : null}
    </div>
  );
};
