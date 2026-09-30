import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, X, RotateCcw, Zap, Play, Pause, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';
import { triggerHapticSelection, triggerHapticSuccess } from '../utils/feedback';

interface RestTimerProps {
  active: boolean;
  seconds: number;
  onClose: () => void;
}

const ITEM_HEIGHT = 44; // 滾輪每個選項的高度（px）
const PRESET_OPTIONS = [60, 90, 120, 180];

interface WheelColumnProps {
  items: number[];
  selectedValue: number;
  onValueChange: (val: number) => void;
  label: string;
}

/**
 * iOS 風格滾輪單列組件
 * 支援 touch-pan-y、scroll-snap、慣性滑動與點選即時置中
 */
const WheelColumn: React.FC<WheelColumnProps> = ({ items, selectedValue, onValueChange, label }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // 當外部 selectedValue 改變時（例如點擊快速預設按鈕），平滑捲動至目標位置
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targetScrollTop = selectedValue * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - targetScrollTop) > 2) {
      isProgrammaticScrollRef.current = true;
      el.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 350);
    }
  }, [selectedValue]);

  // 初次掛載時瞬間定位至當前數值
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = selectedValue * ITEM_HEIGHT;
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    if (clamped !== selectedValue) {
      triggerHapticSelection();
      onValueChange(clamped);
    }
  };

  const handleItemClick = (index: number) => {
    if (containerRef.current) {
      isProgrammaticScrollRef.current = true;
      containerRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
      triggerHapticSelection();
      onValueChange(index);
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 350);
    }
  };

  return (
    <div className="relative flex-1 h-[132px] overflow-hidden select-none">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          scrollSnapType: 'y mandatory',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
        }}
        className="h-full overflow-y-auto no-scrollbar touch-pan-y py-[44px]"
      >
        {items.map((num) => {
          const isSelected = num === selectedValue;
          return (
            <div
              key={num}
              onClick={() => handleItemClick(num)}
              style={{
                height: `${ITEM_HEIGHT}px`,
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always'
              }}
              className={`flex items-center justify-center cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? 'text-black font-black text-2xl scale-110' 
                  : 'text-black/30 font-bold text-lg scale-90 hover:text-black/60'
              }`}
            >
              <span className="tabular-nums">{num.toString().padStart(2, '0')}</span>
              <span className={`text-[10px] font-black uppercase ml-1 transition-opacity ${isSelected ? 'text-black/70' : 'text-black/20'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const RestTimer: React.FC<RestTimerProps> = ({ active, seconds: initialSeconds, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [configSeconds, setConfigSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'countdown' | 'picker'>('countdown');

  // 滾輪選取值（分鐘與秒鐘，0~59）
  const [selectedMinutes, setSelectedMinutes] = useState(() => Math.floor(initialSeconds / 60));
  const [selectedSeconds, setSelectedSeconds] = useState(() => initialSeconds % 60);

  const targetTimeRef = useRef<number | null>(null);
  const notificationSentRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scheduleNativeNotification = useCallback((seconds: number) => {
    if (window.webkit?.messageHandlers?.notificationHandler) {
      window.webkit.messageHandlers.notificationHandler.postMessage({
        action: 'schedule',
        seconds: seconds,
        delay: seconds,
        title: '耶巴蒂',
        body: '組間休息結束！該開始下一組了！'
      });
    }
  }, []);

  const cancelNativeNotification = useCallback(() => {
    if (window.webkit?.messageHandlers?.notificationHandler) {
      window.webkit.messageHandlers.notificationHandler.postMessage({
        action: 'cancel'
      });
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.load();
  }, []);

  // 當 initialSeconds 改變或組件打開時同步狀態
  useEffect(() => {
    if (active) {
      setTimeLeft(initialSeconds);
      setConfigSeconds(initialSeconds);
      setSelectedMinutes(Math.floor(initialSeconds / 60));
      setSelectedSeconds(initialSeconds % 60);
      setIsPaused(false);
      setViewMode('countdown');
      targetTimeRef.current = Date.now() + (initialSeconds * 1000);
      notificationSentRef.current = false;
      cancelNativeNotification();
      scheduleNativeNotification(initialSeconds);
    }
  }, [active, initialSeconds, cancelNativeNotification, scheduleNativeNotification]);

  const handleTimerEnd = useCallback(() => {
    if (notificationSentRef.current) return;
    notificationSentRef.current = true;
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.debug("Audio play blocked", e));
      }
    } catch (e) {
      console.debug("Audio play error", e);
    }
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 150, 500, 150, 300]);
      }
    } catch (e) {
      console.debug("Vibrate error", e);
    }
  }, []);

  // 倒數計時核心邏輯
  useEffect(() => {
    if (!active) { 
      targetTimeRef.current = null; 
      notificationSentRef.current = false; 
      cancelNativeNotification();
      return; 
    }

    if (isPaused) {
      return;
    }

    const updateTimer = () => {
      if (!targetTimeRef.current || isPaused) return;
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) { 
        handleTimerEnd(); 
      }
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [active, isPaused, handleTimerEnd, cancelNativeNotification]);

  if (!active) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  // 當前滾輪選取的總秒數
  const currentWheelTotalSeconds = selectedMinutes * 60 + selectedSeconds;

  // 快速選項點選（在滾輪選擇器模式中）
  const handleQuickSelectInPicker = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    setSelectedMinutes(m);
    setSelectedSeconds(sec);
    triggerHapticSelection();
  };

  // 快速選項點選（在倒數模式中）
  const handleQuickSelectInCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    setSelectedMinutes(m);
    setSelectedSeconds(sec);
    setConfigSeconds(s);
    setTimeLeft(s);
    setIsPaused(false);
    targetTimeRef.current = Date.now() + (s * 1000);
    notificationSentRef.current = false;
    cancelNativeNotification();
    scheduleNativeNotification(s);
    triggerHapticSuccess();
  };

  // 開始自訂時間倒數
  const handleStartCountdown = () => {
    if (currentWheelTotalSeconds <= 0) {
      alert('請設定大於 0 秒的休息時間');
      return;
    }
    setConfigSeconds(currentWheelTotalSeconds);
    setTimeLeft(currentWheelTotalSeconds);
    targetTimeRef.current = Date.now() + (currentWheelTotalSeconds * 1000);
    notificationSentRef.current = false;
    setIsPaused(false);
    cancelNativeNotification();
    scheduleNativeNotification(currentWheelTotalSeconds);
    setViewMode('countdown');
    triggerHapticSuccess();
  };

  // 暫停或繼續
  const handleTogglePause = () => {
    if (isPaused) {
      // 繼續
      targetTimeRef.current = Date.now() + (timeLeft * 1000);
      scheduleNativeNotification(timeLeft);
      setIsPaused(false);
    } else {
      // 暫停
      cancelNativeNotification();
      setIsPaused(true);
    }
    triggerHapticSuccess();
  };

  // 重新開始當前配置時間
  const handleRestart = () => {
    setTimeLeft(configSeconds);
    targetTimeRef.current = Date.now() + (configSeconds * 1000);
    notificationSentRef.current = false;
    setIsPaused(false);
    cancelNativeNotification();
    scheduleNativeNotification(configSeconds);
    triggerHapticSuccess();
  };

  // 結束休息
  const handleReady = () => {
    cancelNativeNotification();
    onClose();
    triggerHapticSuccess();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        style={{ backgroundColor: lightTheme.bg }} 
        className="w-full max-w-xs rounded-[40px] p-6 sm:p-7 border border-black/5 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col items-center">
          {/* 頂部圖標與模式切換標籤 */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div style={{ backgroundColor: lightTheme.card }} className="p-2 rounded-xl border border-black/5 shadow-inner">
              <Timer className={`w-5 h-5 text-black ${!isPaused && timeLeft > 0 && viewMode === 'countdown' ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="text-[12px] font-black uppercase tracking-wider text-black">
              {viewMode === 'countdown' ? (isPaused ? '組間休息 (已暫停)' : '組間休息中') : '設定休息時間'}
            </h3>
          </div>

          {/* 分段模式切換按鈕 */}
          <div className="flex bg-black/5 p-1 rounded-2xl mb-5 w-full">
            <button 
              onClick={() => {
                setViewMode('countdown');
                triggerHapticSelection();
              }}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                viewMode === 'countdown' 
                  ? 'bg-white text-black shadow-xs' 
                  : 'text-black/50 hover:text-black'
              }`}
            >
              倒數中 ({formatTime(timeLeft)})
            </button>
            <button 
              onClick={() => {
                setViewMode('picker');
                triggerHapticSelection();
              }}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                viewMode === 'picker' 
                  ? 'bg-white text-black shadow-xs' 
                  : 'text-black/50 hover:text-black'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 stroke-[2.5]" />
              滾輪設定
            </button>
          </div>

          {/* 視圖 A：倒數計時視圖 */}
          {viewMode === 'countdown' && (
            <div className="w-full flex flex-col items-center">
              {/* 大倒數時間顯示（點擊亦可切換至滾輪自訂模式） */}
              <button 
                onClick={() => {
                  setViewMode('picker');
                  triggerHapticSelection();
                }}
                title="點擊切換滾輪調整時間"
                className="group relative my-2 text-center select-none active:scale-95 transition-transform"
              >
                <div style={{ color: lightTheme.text }} className="text-6xl sm:text-7xl font-bold font-sans tabular-nums tracking-tight">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-1 group-hover:text-black/70 transition-colors">
                  點擊以自訂時間
                </div>
              </button>

              {/* 快速選項（倒數模式下） */}
              <div className="grid grid-cols-4 gap-2 w-full mt-4 mb-6">
                {PRESET_OPTIONS.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleQuickSelectInCountdown(s)} 
                    className={`py-2 rounded-xl text-[11px] font-black transition-all border ${
                      configSeconds === s 
                        ? 'bg-black text-white border-black' 
                        : 'bg-slate-50 text-slate-400 border-black/5 hover:text-black hover:bg-slate-100 shadow-inner'
                    }`}
                  >
                    {s}S
                  </button>
                ))}
              </div>

              {/* 操作按鈕組 */}
              <div className="flex space-x-2.5 w-full">
                <button 
                  onClick={handleRestart} 
                  title="重新計時" 
                  style={{ backgroundColor: '#000000' }} 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-sm shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button 
                  onClick={handleTogglePause} 
                  title={isPaused ? "繼續倒數" : "暫停倒數"}
                  style={{ backgroundColor: lightTheme.card }} 
                  className="w-12 h-12 rounded-2xl border border-black/10 flex items-center justify-center text-black active:scale-95 transition-all shadow-sm shrink-0"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Pause className="w-4 h-4 fill-current" />}
                </button>

                <button 
                  onClick={handleReady} 
                  style={{ backgroundColor: lightTheme.accent }} 
                  className="flex-1 text-black font-black py-3 rounded-2xl active:scale-95 transition-all uppercase text-[13px] tracking-tight flex items-center justify-center gap-1.5 shadow-md shadow-[#CCFF00]/10"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>我準備好了</span>
                </button>
              </div>
            </div>
          )}

          {/* 視圖 B：iOS 原生時鐘風格滾輪時間選擇器 */}
          {viewMode === 'picker' && (
            <div className="w-full flex flex-col items-center">
              {/* 雙欄獨立滾輪容器（分鐘 : 秒鐘） */}
              <div className="relative w-full h-[132px] flex items-center justify-center bg-slate-50/80 rounded-2xl border border-black/5 overflow-hidden my-2 px-3">
                {/* 中央選取標示高光橫條 */}
                <div className="absolute left-2 right-2 top-[44px] h-[44px] bg-black/5 rounded-xl border border-black/5 pointer-events-none" />
                
                {/* 分鐘滾輪 */}
                <WheelColumn 
                  items={Array.from({ length: 60 }, (_, i) => i)} 
                  selectedValue={selectedMinutes} 
                  onValueChange={setSelectedMinutes} 
                  label="分" 
                />

                {/* 冒號分隔 */}
                <div className="z-10 text-2xl font-black text-black px-1 pb-1 select-none pointer-events-none">:</div>

                {/* 秒鐘滾輪 */}
                <WheelColumn 
                  items={Array.from({ length: 60 }, (_, i) => i)} 
                  selectedValue={selectedSeconds} 
                  onValueChange={setSelectedSeconds} 
                  label="秒" 
                />
              </div>

              {/* 快速選項（與滾輪即時雙向連動） */}
              <div className="grid grid-cols-4 gap-2 w-full mt-3 mb-6">
                {PRESET_OPTIONS.map(s => {
                  const isMatching = currentWheelTotalSeconds === s;
                  return (
                    <button 
                      key={s} 
                      onClick={() => handleQuickSelectInPicker(s)} 
                      className={`py-2 rounded-xl text-[11px] font-black transition-all border ${
                        isMatching 
                          ? 'bg-black text-white border-black' 
                          : 'bg-slate-50 text-slate-400 border-black/5 hover:text-black hover:bg-slate-100 shadow-inner'
                      }`}
                    >
                      {s}S
                    </button>
                  );
                })}
              </div>

              {/* 底部開始倒數按鈕 */}
              <div className="flex space-x-2.5 w-full">
                <button 
                  onClick={handleStartCountdown} 
                  style={{ backgroundColor: lightTheme.accent }} 
                  className="flex-1 text-black font-black py-3.5 rounded-2xl active:scale-95 transition-all uppercase text-[14px] tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/15"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>開始倒數 ({formatTime(currentWheelTotalSeconds)})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右上角關閉按鈕 */}
        <button 
          onClick={() => { cancelNativeNotification(); onClose(); }} 
          className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 p-2 transition-colors active:scale-90"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </motion.div>
    </div>
  );
};
