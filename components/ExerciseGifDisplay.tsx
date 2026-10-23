import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getExerciseGifSources, getMuscleGroup, getMuscleGroupDisplay, getExerciseMp4Url, getExercisePosterUrl, isMp4Exercise } from '../utils/fitnessMath';
import { Loader2, Dumbbell, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
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
 * Dedicated MP4 Player for Chest Movements.
 * - Prioritizes dedicated static poster on iPhone/Safari without flashing gray.
 * - Handles play/pause on user interaction without autoplay.
 * - Retains static poster preview on load errors with a retry button.
 * - NEVER falls back to GIF.
 */
const ExerciseMp4Player: React.FC<ExerciseMp4PlayerProps> = ({
  cleanName,
  mp4Url,
  posterUrl,
  containerClassName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoHasError, setVideoHasError] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // Reset state when exercise name or URL changes
  useEffect(() => {
    setIsPlaying(false);
    setIsVideoLoading(true);
    setVideoHasError(false);
    setHasStartedPlaying(false);

    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          // DO NOT call removeAttribute('src') or video.load()!
          // That causes synthetic WebKit onError during component unmount/remount.
        } catch {
          // Ignore pause error on unmount
        }
      }
    };
  }, [cleanName, mp4Url]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (!video) return;

    if (videoHasError) {
      setVideoHasError(false);
      setIsVideoLoading(true);
      video.load();
      video.play().then(() => {
        setIsPlaying(true);
        setHasStartedPlaying(true);
        setIsVideoLoading(false);
      }).catch(err => {
        console.warn('[IronLog Video] Play retry failed:', err);
        setVideoHasError(true);
        setIsVideoLoading(false);
      });
      return;
    }

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setHasStartedPlaying(true);
        setIsVideoLoading(false);
      }).catch(err => {
        console.warn('[IronLog Video] Play request failed:', err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [videoHasError]);

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
        video.play().then(() => {
          setIsPlaying(true);
          setHasStartedPlaying(true);
          setIsVideoLoading(false);
        }).catch(() => {
          setIsVideoLoading(false);
        });
      } catch {
        setIsVideoLoading(false);
      }
    }
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn(`[IronLog Video] MP4 playback error for "${cleanName}". Retaining poster preview; no GIF fallback.`);
    setVideoHasError(true);
    setIsVideoLoading(false);
    setIsPlaying(false);
  }, [cleanName]);

  return (
    <div style={{ backgroundColor: lightTheme.card }} className={containerClassName}>
      {/* 1. Error state with retry overlay while keeping static poster visible */}
      {videoHasError ? (
        <div className="w-full h-full relative flex items-center justify-center">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={cleanName}
              className="w-full h-auto max-h-[360px] object-contain rounded-[15px] block select-none opacity-85"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 text-center z-20 rounded-[24px]">
            <div className="bg-black/90 px-4 py-3 rounded-2xl border border-white/20 text-white flex flex-col items-center gap-2 shadow-2xl max-w-[260px]">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>影片載入暫時中斷</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                已保留靜態姿勢預覽，請確認網路或點擊重試
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-1 px-4 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 text-black font-black text-xs rounded-full flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>點擊重試</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Loading Spinner (only shown when buffering during play or if poster is loading) */}
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

          {/* 3. Static Poster Overlay on iPhone before first play: guarantees crisp preparation posture */}
          {!hasStartedPlaying && posterUrl && (
            <img
              src={posterUrl}
              alt={cleanName}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-[15px] z-[5]"
            />
          )}

          {/* 4. HTML5 Video Element */}
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
              setHasStartedPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onError={handleVideoError}
            onClick={togglePlay}
          />

          {/* 5. Bottom Floating Play / Pause Control Button */}
          {(!isVideoLoading || Boolean(posterUrl)) && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "暫停示範" : "播放示範"}
                className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/15 transition-all cursor-pointer"
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

export const ExerciseGifDisplay: React.FC<ExerciseGifDisplayProps> = ({
  name,
  className = "w-full h-auto object-cover rounded-[15px] block",
  containerClassName = "relative overflow-hidden rounded-[24px] shadow-sm border border-black/5 min-h-[240px] flex items-center justify-center"
}) => {
  const cleanName = (name || '').trim();
  const isMp4 = isMp4Exercise(cleanName);
  const mp4Url = getExerciseMp4Url(cleanName);
  const posterUrl = getExercisePosterUrl(cleanName);

  // If this is an MP4 exercise (Chest or Back), use dedicated MP4 Player with poster (NEVER fall through to GIF)
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

  // Non-chest exercises: Standard GIF player
  return (
    <ExerciseGifPlayer
      cleanName={cleanName}
      className={className}
      containerClassName={containerClassName}
    />
  );
};

