import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Loader2, Dumbbell } from 'lucide-react';

interface ExerciseSmallGifProps {
  name: string;
}

export const ExerciseSmallGif: React.FC<ExerciseSmallGifProps> = ({ name }) => {
  const sources = useMemo(() => getExerciseGifSources(name), [name]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failedAll, setFailedAll] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setLoading(true);
    setFailedAll(false);
  }, [name, sources]);

  const currentSrc = sources[sourceIndex] || '';

  const handleError = useCallback(() => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex(prev => prev + 1);
    } else {
      setLoading(false);
      setFailedAll(true);
    }
  }, [sourceIndex, sources.length]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setFailedAll(false);
  }, []);

  if (failedAll) {
    const mg = getMuscleGroup(name);
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
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        </div>
      )}
      {currentSrc && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={name}
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
};
