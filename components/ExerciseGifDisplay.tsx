import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay, getExerciseMp4Url, getExercisePrimaryFallbackGifUrl, getExercisePosterUrl } from '../utils/fitnessMath';
import { Loader2, Dumbbell, Play, Pause } from 'lucide-react';
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
  const cleanName = (name || '').trim();
  const mp4Url = getExerciseMp4Url(cleanName);
  const posterUrl = getExercisePosterUrl(cleanName);
  const isMp4Exercise = Boolean(mp4Url);

  // Video specific states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  // GIF fallback / standard GIF states
  const sources = useMemo(() => {
    const defaultSources = getExerciseGifSources(cleanName);
    const fallbackGif = getExercisePrimaryFallbackGifUrl(cleanName);
    if (fallbackGif) {
      // Prioritize immutable verified fallback GIF if MP4 failed
      return [
        fallbackGif,
        ...defaultSources.filter(s => s !== fallbackGif)
      ];
    }
    return defaultSources;
  }, [cleanName]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [isGifLoading, setIsGifLoading] = useState(true);
  const [hasGifError, setHasGifError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Reset & cleanup when name changes or unmounts
  useEffect(() => {
    setIsPlaying(false);
    setIsVideoLoading(true);
    setVideoFailed(false);
    setSourceIndex(0);
    setIsGifLoading(true);
    setHasGifError(false);
    setRetryCount(0);

    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch {
          // Ignore unmount cleanup error
        }
      }
    };
  }, [cleanName]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => {
        console.warn('[IronLog Video] Play request failed:', err);
      });
    } else {
      video.pause();
    }
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn(`[IronLog Video] Failed to load/decode MP4 for "${cleanName}". Falling back to original GIF.`);
    setVideoFailed(true);
    setIsVideoLoading(false);
  }, [cleanName]);

  // GIF error / load handlers
  const currentSrc = sources[sourceIndex] || '';

  const handleGifError = useCallback(() => {
    console.warn(`[IronLog Media] Failed to load GIF for "${cleanName}" from source [${sourceIndex}]: ${currentSrc}`);
    
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex(prev => prev + 1);
      setIsGifLoading(true);
    } else if (retryCount < 1) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setSourceIndex(0);
        setIsGifLoading(true);
      }, 800);
    } else {
      console.error(`[IronLog Media] All sources exhausted for "${cleanName}". Rendering visual fallback card.`);
      setIsGifLoading(false);
      setHasGifError(true);
    }
  }, [cleanName, sourceIndex, sources, currentSrc, retryCount]);

  const handleGifLoad = useCallback(() => {
    setIsGifLoading(false);
    setHasGifError(false);
  }, []);

  const muscleGroup = getMuscleGroup(cleanName);
  const muscleDisplay = getMuscleGroupDisplay(muscleGroup);

  // Render MP4 player for chest movements with verified MP4 (unless video load failed)
  if (isMp4Exercise && !videoFailed && mp4Url) {
    return (
      <div style={{ backgroundColor: lightTheme.card }} className={containerClassName}>
        {/* Loading Spinner - only if waiting without poster or buffering during active playback */}
        {isVideoLoading && (!posterUrl || isPlaying) && (
          <div 
            style={{ backgroundColor: !posterUrl ? lightTheme.card : undefined }} 
            className={`absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none ${
              posterUrl ? 'bg-black/30 backdrop-blur-[2px]' : ''
            }`}
          >
            <Loader2 className={`w-8 h-8 animate-spin ${posterUrl ? 'text-white' : 'text-black'}`} />
            <p className={`text-[11px] font-black uppercase tracking-widest ${posterUrl ? 'text-white' : 'text-black'}`}>
              {isPlaying ? '影片載入中...' : '動作準備中...'}
            </p>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={mp4Url}
          poster={posterUrl || undefined}
          playsInline
          muted
          loop
          preload="metadata"
          style={{ objectFit: 'contain' }}
          className="w-full h-auto max-h-[360px] object-contain rounded-[15px] block cursor-pointer select-none"
          onLoadedMetadata={() => setIsVideoLoading(false)}
          onLoadedData={() => setIsVideoLoading(false)}
          onCanPlay={() => setIsVideoLoading(false)}
          onWaiting={() => setIsVideoLoading(true)}
          onPlaying={() => {
            setIsVideoLoading(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onError={handleVideoError}
          onClick={togglePlay}
        />

        {/* Bottom Floating Play / Pause Control Button (Only custom play control) */}
        {(!isVideoLoading || Boolean(posterUrl)) && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "暫停示範" : "播放示範"}
              className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/15 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>暫停</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                  <span>播放</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Standard GIF rendering (for all other exercises, or as fallback when MP4 fails)
  return (
    <div style={{ backgroundColor: lightTheme.card }} className={containerClassName}>
      {isGifLoading && (
        <div 
          style={{ backgroundColor: lightTheme.card }} 
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
        >
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-[11px] font-black uppercase tracking-widest text-black">動作準備中...</p>
        </div>
      )}

      {hasGifError ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/25 flex items-center justify-center text-slate-900 border border-[#82CC00]/30 shadow-sm">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900">{cleanName}</h4>
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
          alt={cleanName}
          className={className}
          onLoad={handleGifLoad}
          onError={handleGifError}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ) : null}
    </div>
  );
};
