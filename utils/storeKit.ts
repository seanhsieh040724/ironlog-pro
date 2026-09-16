import { useState, useEffect } from 'react';
import {
  SubscriptionStatus,
  StoreKitProduct,
  EntitlementInfo,
  PurchaseResult,
  RestoreResult
} from '../types';

/**
 * 官方 App Store Connect 預定配置之產品 ID
 */
export const DEFAULT_PRO_PRODUCT_ID = 'com.ironlog.pro.monthly';

/**
 * 預設商品清單（供離線/未連接原生時讀取規格展示，真實資料在 Native 接通後自 StoreKit 2 覆蓋）
 */
export const DEFAULT_PRODUCTS: StoreKitProduct[] = [
  {
    id: DEFAULT_PRO_PRODUCT_ID,
    displayName: 'IronLog Pro 尊榮版 (月費方案)',
    description: '無限次 AI 食物熱量拍照與營養分析、專屬 AI 鋼鐵教練、進階 TDEE 自訂與完整雲端趨勢圖表',
    displayPrice: 'NT$ 100',
    price: 100,
    currencyCode: 'TWD',
    subscriptionPeriod: {
      unit: 'month',
      value: 1
    }
  }
];

/**
 * 預設非 Pro 狀態
 */
export const INITIAL_ENTITLEMENT: EntitlementInfo = {
  isPro: false,
  status: 'inactive',
  productId: null,
  expirationDate: null,
  willAutoRenew: false,
  isSandbox: false,
  originalPurchaseDate: null
};

// 當前記憶體中的會員狀態（預設未開通，以 Native StoreKit 2 真實憑證為準）
let currentEntitlement: EntitlementInfo = { ...INITIAL_ENTITLEMENT };

// 訂閱事件監聽器集合
const entitlementListeners = new Set<(entitlement: EntitlementInfo) => void>();

// 待處理的原生通訊 Promise 回調對照表
const pendingCallbacks = new Map<string, {
  resolve: (data: any) => void;
  reject: (err: any) => void;
}>();

/**
 * A. 檢查目前執行環境是否具備 iOS 原生 StoreKit 2 WKScriptMessageHandler 橋接能力
 */
export const isNativeStoreKitAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.webkit?.messageHandlers?.storeKitHandler)
  );
};

/**
 * D. 接收並掛載 window.__IRONLOG_STOREKIT_CALLBACK__
 * 支援 actions:
 * - products
 * - purchaseResult
 * - entitlementUpdated
 * - entitlement_updated
 * - restoreResult
 * - error
 */
if (typeof window !== 'undefined') {
  window.__IRONLOG_STOREKIT_CALLBACK__ = (payload: any) => {
    if (!payload || typeof payload !== 'object') return;

    const { action, requestId, data, error } = payload;

    // 1. 若有對應的 requestId，通知關聯的 Promise
    if (requestId && pendingCallbacks.has(requestId)) {
      const { resolve, reject } = pendingCallbacks.get(requestId)!;
      pendingCallbacks.delete(requestId);

      if (action === 'error' || error) {
        reject(new Error(error || 'StoreKit 操作失敗'));
        return;
      }

      if (action === 'purchaseResult') {
        if (data?.entitlement) {
          updateEntitlement(data.entitlement);
        }
        resolve(data);
        return;
      }

      if (action === 'restoreResult') {
        if (data?.entitlement) {
          updateEntitlement(data.entitlement);
        }
        resolve(data);
        return;
      }

      if (action === 'entitlementUpdated' || action === 'entitlement_updated') {
        if (data) {
          updateEntitlement(data);
        }
        resolve(data);
        return;
      }

      if (action === 'products') {
        resolve(data);
        return;
      }

      resolve(data);
      return;
    }

    // 2. 處理原生未帶 requestId 之主動推播 (例如 Transaction.updates 交易更新推播)
    if ((action === 'entitlement_updated' || action === 'entitlementUpdated') && data) {
      updateEntitlement(data);
    }
  };
}

/**
 * E. 更新本地會員狀態並通知所有監聽的 React 元件
 */
export const updateEntitlement = (newEntitlement: Partial<EntitlementInfo>) => {
  const isPro = typeof newEntitlement.isPro === 'boolean'
    ? newEntitlement.isPro
    : newEntitlement.status === 'active';

  currentEntitlement = {
    isPro,
    status: (newEntitlement.status as SubscriptionStatus) || (isPro ? 'active' : 'inactive'),
    productId: newEntitlement.productId !== undefined ? newEntitlement.productId : (isPro ? DEFAULT_PRO_PRODUCT_ID : null),
    expirationDate: typeof newEntitlement.expirationDate === 'number' ? newEntitlement.expirationDate : null,
    willAutoRenew: Boolean(newEntitlement.willAutoRenew),
    isSandbox: Boolean(newEntitlement.isSandbox),
    originalPurchaseDate: typeof newEntitlement.originalPurchaseDate === 'number' ? newEntitlement.originalPurchaseDate : null
  };

  entitlementListeners.forEach((listener) => {
    try {
      listener(currentEntitlement);
    } catch (e) {
      console.error('[StoreKit] Error in entitlement listener callback:', e);
    }
  });
};

/**
 * C. 向 iOS 原生 storeKitHandler 發送訊息的輔助函式
 */
export const sendNativeMessage = <T = any>(action: string, payload: Record<string, any> = {}): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (!isNativeStoreKitAvailable()) {
      reject(new Error('Native StoreKit 2 bridge not available'));
      return;
    }

    const requestId = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 15 秒逾時保護
    const timer = setTimeout(() => {
      if (pendingCallbacks.has(requestId)) {
        pendingCallbacks.delete(requestId);
        reject(new Error('StoreKit request timed out'));
      }
    }, 15000);

    pendingCallbacks.set(requestId, {
      resolve: (data) => {
        clearTimeout(timer);
        resolve(data);
      },
      reject: (err) => {
        clearTimeout(timer);
        reject(err);
      }
    });

    try {
      window.webkit!.messageHandlers!.storeKitHandler!.postMessage({
        action,
        requestId,
        ...payload
      });
    } catch (err) {
      clearTimeout(timer);
      pendingCallbacks.delete(requestId);
      reject(err);
    }
  });
};

/**
 * B1. 取得 StoreKit 2 訂閱商品清單
 */
export const getProducts = async (
  productIds: string[] = [DEFAULT_PRO_PRODUCT_ID]
): Promise<StoreKitProduct[]> => {
  if (!isNativeStoreKitAvailable()) {
    // Web 環境：返回設定檔商品原型，供介面排版顯示，不報錯
    return DEFAULT_PRODUCTS;
  }

  try {
    const products = await sendNativeMessage<StoreKitProduct[]>('getProducts', {
      productIds: productIds && productIds.length > 0 ? productIds : [DEFAULT_PRO_PRODUCT_ID]
    });
    return Array.isArray(products) && products.length > 0 ? products : DEFAULT_PRODUCTS;
  } catch (error) {
    console.warn('[StoreKit] getProducts fallback to default catalog:', error);
    return DEFAULT_PRODUCTS;
  }
};

/**
 * B2 & G. 喚起 StoreKit 2 購買流程
 * 購買成功後以 Native 回傳的 entitlement.isPro 為準
 */
export const purchase = async (
  productId: string = DEFAULT_PRO_PRODUCT_ID
): Promise<PurchaseResult> => {
  if (!isNativeStoreKitAvailable()) {
    return {
      success: false,
      error: '目前處於 Web 預覽環境，尚未連接 iOS App Store 原生 StoreKit 2。請在 iOS 原生 App 中執行 Apple 原生購買。'
    };
  }

  try {
    const result = await sendNativeMessage<{
      entitlement?: EntitlementInfo;
      userCancelled?: boolean;
    }>('purchase', {
      productId: productId || DEFAULT_PRO_PRODUCT_ID
    });

    if (result?.userCancelled) {
      return {
        success: false,
        userCancelled: true,
        error: '使用者已取消購買'
      };
    }

    if (result?.entitlement) {
      updateEntitlement(result.entitlement);
      return {
        success: Boolean(result.entitlement.isPro),
        entitlement: currentEntitlement
      };
    }

    return {
      success: false,
      error: '購買處理未返回有效憑證'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || '購買失敗'
    };
  }
};

/**
 * B3 & H. 恢復購買 (Restore Purchases)
 * 呼叫 App Store sync 並依 Native 回傳更新 Pro 狀態
 */
export const restorePurchases = async (): Promise<RestoreResult> => {
  if (!isNativeStoreKitAvailable()) {
    return {
      success: false,
      error: '目前處於 Web 預覽環境，尚未連接 iOS 原生 StoreKit 2。'
    };
  }

  try {
    const result = await sendNativeMessage<{ entitlement?: EntitlementInfo }>('restorePurchases');
    if (result?.entitlement) {
      updateEntitlement(result.entitlement);
      return {
        success: Boolean(result.entitlement.isPro),
        entitlement: currentEntitlement,
        error: result.entitlement.isPro ? undefined : '未查詢到先前的有效購買紀錄'
      };
    }
    return {
      success: false,
      error: '未查詢到先前的有效購買紀錄'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || '恢復購買失敗'
    };
  }
};

/**
 * B4 & I. 取得當前會員資格與訂閱狀態 (冷啟動或頁面切換同步)
 */
export const getCurrentEntitlements = async (): Promise<EntitlementInfo> => {
  if (!isNativeStoreKitAvailable()) {
    return currentEntitlement;
  }

  try {
    const entitlement = await sendNativeMessage<EntitlementInfo>('getCurrentEntitlements');
    if (entitlement) {
      updateEntitlement(entitlement);
    }
    return currentEntitlement;
  } catch (error) {
    console.warn('[StoreKit] getCurrentEntitlements failed:', error);
    return currentEntitlement;
  }
};

/**
 * 訂閱會員狀態更新事件 (用於非 React 模組或全域監聽)
 */
export const subscribeToEntitlementUpdates = (
  callback: (entitlement: EntitlementInfo) => void
): (() => void) => {
  entitlementListeners.add(callback);
  // 立即觸發一次當前狀態
  callback(currentEntitlement);
  return () => {
    entitlementListeners.delete(callback);
  };
};

/**
 * React Hook：供元件即時訂閱並取得統一的會員狀態
 */
export const useEntitlement = (): EntitlementInfo => {
  const [entitlement, setEntitlement] = useState<EntitlementInfo>(currentEntitlement);

  useEffect(() => {
    return subscribeToEntitlementUpdates((updated) => {
      setEntitlement({ ...updated });
    });
  }, []);

  return entitlement;
};

// I. 模組載入時，若處於 iOS 原生 WKWebView 內，立即進行一次查詢同步
if (isNativeStoreKitAvailable()) {
  getCurrentEntitlements().catch((err) => {
    console.warn('[StoreKit] Auto init getCurrentEntitlements error:', err);
  });
}
