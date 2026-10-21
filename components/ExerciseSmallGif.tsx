import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay, getExerciseMp4Url, getExercisePrimaryFallbackGifUrl, getExercisePosterUrl } from '../utils/fitnessMath';
import { Loader2, Dumbbell } from 'lucide-react';

interface ExerciseSmallGifProps {
  name: string;
}

export const ExerciseSmallGif: React.FC<ExerciseSmallGifProps> = ({ name }) => {
  const cleanName = (name || '').trim();
  const mp4Url = getExerciseMp4Url(cleanName);
  const posterUrl = getExercisePosterUrl(cleanName);
  const isMp4Exercise = Boolean(mp4Url);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const sources = useMemo(() => {
    const defaultSources = getExerciseGifSources(cleanName);
    const fallbackGif = getExercisePrimaryFallbackGifUrl(cleanName);
    if (fallbackGif) {
      return [
        fallbackGif,
        ...defaultSources.filter(s => s !== fallbackGif)
      ];
    }
    return defaultSources;
  }, [cleanName]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failedAll, setFailedAll] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setLoading(true);
    setFailedAll(false);
    setVideoFailed(false);

    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch {
          // Ignore cleanup error
        }
      }
    };
  }, [cleanName]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0.001;
      } catch {
        // Ignore seek error
      }
    }
    setLoading(false);
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn(`[IronLog SmallMedia] MP4 thumbnail failed for "${cleanName}". Falling back to GIF.`);
    setVideoFailed(true);
  }, [cleanName]);

  const handleGifError = useCallback(() => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex(prev => prev + 1);
    } else {
      setLoading(false);
      setFailedAll(true);
    }
  }, [sourceIndex, sources.length]);

  const handleGifLoad = useCallback(() => {
    setLoading(false);
    setFailedAll(false);
  }, []);

  if (failedAll) {
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
      {loading && !posterUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        </div>
      )}

      {/* Chest Movements: Render static MP4 video thumbnail frame */}
      {isMp4Exercise && !videoFailed && mp4Url ? (
        <video
          ref={videoRef}
          src={`${mp4Url}#t=0.001`}
          poster={posterUrl || undefined}
          preload="metadata"
          muted
          playsInline
          autoPlay={false}
          loop={false}
          controls={false}
          tabIndex={-1}
          aria-hidden="true"
          style={{ objectFit: 'cover' }}
          className="w-full h-full object-cover pointer-events-none select-none block"
          onLoadedMetadata={handleVideoLoaded}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
        />
      ) : currentSrc ? (
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
