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

// 當前記憶體中的會員狀態（預設未開通，不再由 localStorage 決定）
let currentEntitlement: EntitlementInfo = {
  isPro: false,
  status: 'inactive',
  productId: null,
  expirationDate: null,
  willAutoRenew: false,
  isSandbox: false,
  originalPurchaseDate: null
};

// 訂閱事件監聽器集合
const entitlementListeners = new Set<(entitlement: EntitlementInfo) => void>();

// 待處理的原生通訊 Promise 回調對照表
const pendingCallbacks = new Map<string, {
  resolve: (data: any) => void;
  reject: (err: any) => void;
}>();

/**
 * 檢查目前執行環境是否具備 iOS 原生 StoreKit 2 WKScriptMessageHandler 橋接能力
 */
export const isNativeStoreKitAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
    Boolean(window.webkit?.messageHandlers?.storeKitHandler);
};

/**
 * 初始化全域原生橋接回呼監聽
 */
if (typeof window !== 'undefined') {
  window.__IRONLOG_STOREKIT_CALLBACK__ = (payload: any) => {
    if (!payload || typeof payload !== 'object') return;

    const { action, requestId, data, error } = payload;

    // 1. 若有對應的 requestId，通知關聯的 Promise
    if (requestId && pendingCallbacks.has(requestId)) {
      const { resolve, reject } = pendingCallbacks.get(requestId)!;
      pendingCallbacks.delete(requestId);
      if (error) {
        reject(new Error(error));
      } else {
        resolve(data);
      }
    }

    // 2. 處理原生推送的會員狀態變更事件 (Transaction.updates / currentEntitlements)
    if (action === 'entitlement_updated' && data) {
      updateEntitlement(data);
    }
  };
}

/**
 * 更新本地狀態並通知所有監聽的 React 元件
 */
const updateEntitlement = (newEntitlement: Partial<EntitlementInfo>) => {
  currentEntitlement = {
    ...currentEntitlement,
    ...newEntitlement,
    isPro: newEntitlement.status === 'active'
  };
  entitlementListeners.forEach(listener => {
    try {
      listener(currentEntitlement);
    } catch (e) {
      console.error('[StoreKitBridge] Error in listener callback', e);
    }
  });
};

/**
 * 向 iOS 原生發送訊息的輔助函式
 */
const sendNativeMessage = <T = any>(action: string, payload: any = {}): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (!isNativeStoreKitAvailable()) {
      reject(new Error('Native StoreKit 2 bridge not available'));
      return;
    }

    const requestId = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    pendingCallbacks.set(requestId, { resolve, reject });

    // 設定逾時保護
    setTimeout(() => {
      if (pendingCallbacks.has(requestId)) {
        pendingCallbacks.delete(requestId);
        reject(new Error('StoreKit request timed out'));
      }
    }, 15000);

    try {
      window.webkit!.messageHandlers!.storeKitHandler!.postMessage({
        action,
        requestId,
        ...payload
      });
    } catch (err) {
      pendingCallbacks.delete(requestId);
      reject(err);
    }
  });
};

/**
 * 1. 取得 StoreKit 2 訂閱商品清單
 */
export const getProducts = async (): Promise<StoreKitProduct[]> => {
  if (!isNativeStoreKitAvailable()) {
    // Web 環境：返回設定檔商品原型，供介面排版顯示
    return DEFAULT_PRODUCTS;
  }

  try {
    const products = await sendNativeMessage<StoreKitProduct[]>('getProducts', {
      productIds: [DEFAULT_PRO_PRODUCT_ID]
    });
    return Array.isArray(products) && products.length > 0 ? products : DEFAULT_PRODUCTS;
  } catch (error) {
    console.warn('[StoreKitBridge] getProducts fallback to default catalog:', error);
    return DEFAULT_PRODUCTS;
  }
};

/**
 * 2. 喚起 StoreKit 2 購買流程
 * ⚠️ 在 Web 環境下絕不偽造付款成功，明確返回未連接原生錯誤
 */
export const purchase = async (productId: string = DEFAULT_PRO_PRODUCT_ID): Promise<PurchaseResult> => {
  if (!isNativeStoreKitAvailable()) {
    return {
      success: false,
      error: '目前處於 Web 預覽環境，尚未連接 iOS App Store 原生 StoreKit 2。請在 iOS 原生 App 中執行真正的 Apple 付款。'
    };
  }

  try {
    const result = await sendNativeMessage<{ entitlement: EntitlementInfo; userCancelled?: boolean }>('purchase', {
      productId
    });

    if (result.userCancelled) {
      return {
        success: false,
        userCancelled: true,
        error: '使用者已取消購買'
      };
    }

    if (result.entitlement) {
      updateEntitlement(result.entitlement);
      return {
        success: true,
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
 * 3. 恢復購買 (Restore Purchases)
 */
export const restorePurchases = async (): Promise<RestoreResult> => {
  if (!isNativeStoreKitAvailable()) {
    return {
      success: false,
      error: '目前處於 Web 預覽環境，尚未連接 iOS App Store 原生 StoreKit 2。'
    };
  }

  try {
    const result = await sendNativeMessage<{ entitlement: EntitlementInfo }>('restorePurchases');
    if (result.entitlement) {
      updateEntitlement(result.entitlement);
      return {
        success: true,
        entitlement: currentEntitlement
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
 * 4. 取得當前會員資格與訂閱狀態
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
    console.warn('[StoreKitBridge] getCurrentEntitlements failed:', error);
    return currentEntitlement;
  }
};

/**
 * 5. 訂閱會員狀態更新事件
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
