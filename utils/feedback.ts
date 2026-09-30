/**
 * 輕微觸覺震動（Haptic Feedback）與低調短促音效回饋
 * 符合 iOS 原生風格規範：
 * - 優先使用原生觸覺（WKWebView messageHandler / navigator.vibrate 輕量短 pulse）
 * - 備援使用 Web Audio API 產生非常短（<80ms）、低音量、溫和的單次提示音
 * - 絕無突兀或長時間震動，無大聲刺耳音效
 */
export const triggerHapticSuccess = (): void => {
  let hapticFired = false;

  // 1. iOS 原生 WKScriptMessageHandler 觸覺回饋橋接
  try {
    const webkit = (window as any).webkit;
    if (webkit?.messageHandlers?.hapticFeedback) {
      webkit.messageHandlers.hapticFeedback.postMessage({ type: 'impactLight' });
      hapticFired = true;
    } else if (webkit?.messageHandlers?.notificationHandler) {
      webkit.messageHandlers.notificationHandler.postMessage({ action: 'haptic', style: 'light' });
      hapticFired = true;
    } else if (webkit?.messageHandlers?.haptic) {
      webkit.messageHandlers.haptic.postMessage('light');
      hapticFired = true;
    }
  } catch {
    // 忽略原生橋接異常
  }

  // 2. 標準 Web Vibration API（輕微短震動 15ms）
  if (!hapticFired && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      const didVibrate = navigator.vibrate(15);
      if (didVibrate) {
        hapticFired = true;
      }
    } catch {
      // 忽略震動受安全策略限制之異常
    }
  }

  // 3. Fallback 短促低調音效（Web Audio API）
  // 頻率約 660Hz 滑至 880Hz，持續 70ms，增益低（0.05），自然平滑衰減
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05); // A5

      // 柔和淡出，極低分貝
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {
          // ignore
        }
      }, 150);
    }
  } catch {
    // 忽略音訊受瀏覽器自動播放策略限制
  }
};
