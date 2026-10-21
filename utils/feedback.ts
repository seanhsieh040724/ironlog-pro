let lastSelectionHapticTime = 0;

/**
 * 觸發 iOS 原生 UISelectionFeedbackGenerator（專供滾輪選取值改變）
 * 限制觸發頻率避免過度震動，僅在選值切換時輕微觸覺回饋
 */
export const triggerHapticSelection = (): void => {
  const now = Date.now();
  if (now - lastSelectionHapticTime < 45) return; // 45ms 節流，確保快速滑動時流暢不卡頓
  lastSelectionHapticTime = now;

  // 1. iOS 原生 WKScriptMessageHandler UISelectionFeedbackGenerator 橋接
  try {
    const webkit = (window as any).webkit;
    if (webkit?.messageHandlers?.notificationHandler) {
      webkit.messageHandlers.notificationHandler.postMessage({ action: 'haptic', style: 'selection' });
      return;
    } else if (webkit?.messageHandlers?.hapticFeedback) {
      webkit.messageHandlers.hapticFeedback.postMessage({ type: 'selection' });
      return;
    }
  } catch {
    // 忽略原生異常
  }

  // 2. 標準 Web Vibration API Fallback（輕微短震動 6ms）
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(6);
    } catch {
      // 忽略
    }
  }
};

/**
 * 輕微觸覺震動（Haptic Feedback）
 * 符合 iOS 原生風格規範：
 * - 優先使用原生觸覺（WKWebView messageHandler: UIImpactFeedbackGenerator / UISelectionFeedbackGenerator）
 * - 備援使用標準 Web Vibration API（navigator.vibrate 輕量短 pulse）
 * - 絕不建立 Web Audio API / AudioContext，確保不佔用 iOS Audio Session、不中斷其他音樂 App
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
};
