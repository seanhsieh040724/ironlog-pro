import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay, getExerciseMp4Url, getExercisePosterUrl, isMp4Exercise } from '../utils/fitnessMath';
import { Loader2, Dumbbell, RotateCcw, AlertCircle } from 'lucide-react';
import { lightTheme } from '../themeStyles';

interface ExerciseGifDisplayProps {
  name: string;
  className?: string;
  containerClassName?: string;
}

interface ExerciseMp4PlayerProps {
  cleanName: string;
  mp4Url: string;
  posterUrl: string | null;
  containerClassName: string;
}

/**
 * Dedicated MP4 Player for Exercise Movements (Chest, Back, Shoulders, Legs, Arms & Core).
 * - Auto-plays immediately on entering the detail page.
 * - Infinite loop (loop) & muted playback for iOS Safari compliance.
 * - playsInline to prevent full-screen takeover on iPhone.
 * - Pure white #FFFFFF container background with zero gray masks, dark overlays, or blur filters.
 * - No manual play/pause buttons or overlay controls.
 * - Crisp static JPG poster during initial load and graceful retry upon network failure.
 * - NEVER falls back to GIF.
 */
const ExerciseMp4Player: React.FC<ExerciseMp4PlayerProps> = ({
  cleanName,
  mp4Url,
  posterUrl,
  containerClassName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoHasError, setVideoHasError] = useState(false);

  // Attempt auto-play and ensure video is muted and playsInline for iOS Safari compliance
  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Quietly handle autoplay policy or pending load
        console.warn('[IronLog Video] Autoplay pending or prevented:', err);
      });
    }
  }, []);

  // Trigger auto-play on mount and when exercise URL changes; cleanup on unmount/tab switch
  useEffect(() => {
    setIsVideoLoading(true);
    setVideoHasError(false);

    attemptPlay();

    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {
          // Ignore pause error on unmount
        }
      }
    };
  }, [cleanName, mp4Url, attemptPlay]);

  const handleRetry = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setVideoHasError(false);
    setIsVideoLoading(true);
    const video = videoRef.current;
    if (video) {
      try {
        video.load();
        attemptPlay();
      } catch {
        setIsVideoLoading(false);
      }
    }
  }, [attemptPlay]);

  const handleVideoError = useCallback(() => {
    console.warn(`[IronLog Video] MP4 playback error for "${cleanName}". Retaining poster preview; no GIF fallback.`);
    setVideoHasError(true);
    setIsVideoLoading(false);
  }, [cleanName]);

  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      attemptPlay();
    }
  }, [attemptPlay]);

  return (
    <div style={{ backgroundColor: '#FFFFFF' }} className={containerClassName}>
      {/* 1. Error state: Retains crisp JPG Poster on pure white background, with sleek non-intrusive retry pill */}
      {videoHasError ? (
        <div className="w-full h-full relative flex items-center justify-center bg-white">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={cleanName}
              className="w-full h-auto max-h-[220px] sm:max-h-[260px] md:max-h-[300px] object-contain rounded-2xl block select-none mx-auto bg-white"
            />
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/90 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/10 z-20 whitespace-nowrap">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">影片載入暫時中斷</span>
            <button
              type="button"
              onClick={handleRetry}
              className="px-2.5 py-0.5 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 text-black font-black text-[11px] rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs ml-1"
            >
              <RotateCcw className="w-3 h-3 stroke-[2.5]" />
              <span>重試</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Loading state: Pure white background, zero gray masks or blur overlays */}
          {isVideoLoading && !posterUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10 pointer-events-none">
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            </div>
          )}

          {/* 3. HTML5 Video Element: Autoplay, infinite loop, muted, playsInline, pure white background */}
          <video
            ref={videoRef}
            key={mp4Url}
            src={mp4Url}
            poster={posterUrl || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{ objectFit: 'contain', backgroundColor: '#FFFFFF' }}
            className="w-full h-auto max-h-[220px] sm:max-h-[260px] md:max-h-[300px] object-contain rounded-2xl block select-none mx-auto bg-white"
            onLoadedMetadata={() => {
              setIsVideoLoading(false);
              attemptPlay();
            }}
            onLoadedData={() => {
              setIsVideoLoading(false);
              attemptPlay();
            }}
            onCanPlay={() => {
              setIsVideoLoading(false);
              attemptPlay();
            }}
            onPlaying={() => {
              setIsVideoLoading(false);
            }}
            onEnded={() => {
              attemptPlay();
            }}
            onError={handleVideoError}
            onClick={handleVideoClick}
          />
        </>
      )}
    </div>
  );
};

interface ExerciseGifPlayerProps {
  cleanName: string;
  className: string;
  containerClassName: string;
}

/**
 * Standard GIF Player for Non-Chest Movements (Back, Legs, Shoulders, Arms, Core, etc.)
 * - Retains verified multi-source CDN fallbacks and error card.
 */
const ExerciseGifPlayer: React.FC<ExerciseGifPlayerProps> = ({
  cleanName,
  className,
  containerClassName
}) => {
  const sources = useMemo(() => getExerciseGifSources(cleanName), [cleanName]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isGifLoading, setIsGifLoading] = useState(true);
  const [hasGifError, setHasGifError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
    setIsGifLoading(true);
    setHasGifError(false);
    setRetryCount(0);
  }, [cleanName]);

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

  return (
    <div style={{ backgroundColor: '#FFFFFF' }} className={containerClassName}>
      {isGifLoading && (
        <div 
          style={{ backgroundColor: '#FFFFFF' }} 
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
        >
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-[11px] font-black uppercase tracking-widest text-black">動作準備中...</p>
        </div>
      )}

      {hasGifError ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3 bg-white">
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

export const ExerciseGifDisplay: React.FC<ExerciseGifDisplayProps> = ({
  name,
  className = "w-full h-auto object-cover rounded-2xl block",
  containerClassName = "relative overflow-hidden rounded-2xl flex items-center justify-center bg-white min-h-[180px] sm:min-h-[220px]"
}) => {
  const cleanName = (name || '').trim();
  const isMp4 = isMp4Exercise(cleanName);
  const mp4Url = getExerciseMp4Url(cleanName);
  const posterUrl = getExercisePosterUrl(cleanName);

  // If this is an MP4 exercise (Chest, Back, Shoulders or Legs), use dedicated MP4 Player with poster (NEVER fall through to GIF)
  if (isMp4) {
    return (
      <ExerciseMp4Player
        cleanName={cleanName}
        mp4Url={mp4Url || ''}
        posterUrl={posterUrl}
        containerClassName={containerClassName}
      />
    );
  }

  // Non-MP4 exercises (Arms, Core, etc.): Standard GIF player
  return (
    <ExerciseGifPlayer
      cleanName={cleanName}
      className={className}
      containerClassName={containerClassName}
    />
  );
};

