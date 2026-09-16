import React, { useState, useEffect } from 'react';
import { 
  useEntitlement, 
  purchase, 
  restorePurchases, 
  isNativeStoreKitAvailable, 
  DEFAULT_PRO_PRODUCT_ID,
  getProducts
} from '../services/storeKitBridge';
import { StoreKitProduct } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, Loader2, Lock } from 'lucide-react';

interface ProPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const ProPaywall: React.FC<ProPaywallProps> = ({
  isOpen,
  onClose,
  featureTitle,
  featureDescription
}) => {
  const entitlement = useEntitlement();
  const [products, setProducts] = useState<StoreKitProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const isNativeAvailable = isNativeStoreKitAvailable();

  // 載入商品資訊 (以 StoreKit 2 回傳資料為準)
  useEffect(() => {
    let isMounted = true;
    getProducts([DEFAULT_PRO_PRODUCT_ID]).then((prods) => {
      if (isMounted && prods && prods.length > 0) {
        setProducts(prods);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 當使用者訂閱為 Pro 時，自動關閉 Paywall
  useEffect(() => {
    if (entitlement.isPro && isOpen) {
      setMessage(null);
      onClose();
    }
  }, [entitlement.isPro, isOpen, onClose]);

  // 每次開啟時重設提示訊息
  useEffect(() => {
    if (isOpen) {
      setMessage(null);
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!isNativeAvailable) {
      setMessage({
        type: 'info',
        text: '目前處於 Web 預覽環境，尚未連接 iOS App Store 原生 StoreKit 2。請在 iOS 原生 App 中執行 Apple 原生購買。'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const res = await purchase(DEFAULT_PRO_PRODUCT_ID);
      if (res.success) {
        setMessage({ type: 'success', text: '🎉 訂閱成功！IronLog Pro 尊榮版已生效。' });
      } else {
        if (!res.userCancelled) {
          setMessage({ type: 'error', text: res.error || '購買未成功，請稍後再試。' });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || '購買失敗，請確認網路連線。' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!isNativeAvailable) {
      setMessage({
        type: 'info',
        text: '目前處於 Web 預覽環境，尚未連接 iOS 原生 StoreKit 2。'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const res = await restorePurchases();
      if (res.success) {
        setMessage({ type: 'success', text: '🎉 恢復成功！您的 Pro 會員權益已重新啟用。' });
      } else {
        setMessage({ type: 'error', text: res.error || '未查詢到先前的有效購買紀錄。' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || '恢復購買失敗，請確認網路。' });
    } finally {
      setIsLoading(false);
    }
  };

  const proPerks = [
    { title: 'AI 鋼鐵教練', desc: '無限次即時對話諮詢（支援港式 / 台式雙語氣）' },
    { title: 'AI 食物拍照分析', desc: '相機拍照即時辨識卡路里與三大巨量營養素' },
    { title: 'TDEE 營養比例自訂', desc: '自由調整蛋白質、碳水與脂肪克數與比例' },
    { title: '無限組自訂課表', desc: '建立並保存無限組專屬訓練課表' },
    { title: '進階肌群與容量分析', desc: '完整人體肌群熱圖與週 / 月累積訓練量' },
    { title: 'JSON 資料匯出備份', desc: '隨時完整匯出訓練與營養紀錄至本機' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">IronLog Pro</h3>
                  <span className="text-[10px] font-bold text-slate-400">專業健身訂閱方案</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 觸發原因提示（若有傳入） */}
            {featureTitle && (
              <div className="bg-[#CCFF00]/15 border border-[#82CC00]/40 rounded-2xl p-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {featureTitle} 為 Pro 專屬功能
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 mt-0.5 leading-snug">
                    {featureDescription || '升級 IronLog Pro 即可立即解鎖此功能與所有專業權益。'}
                  </p>
                </div>
              </div>
            )}

            {/* 權益清單 */}
            <div className="space-y-2 py-0.5">
              {proPerks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#82CC00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-900 mr-1">{perk.title}</span>
                    <span className="text-slate-500 font-medium text-[11px]">{perk.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 方案價格卡片 */}
            <div className="bg-[#CCFF00]/10 p-3.5 rounded-2xl text-center border border-[#82CC00]/30 space-y-1.5">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {products[0]?.displayPrice || 'NT$ 100'}
                </span>
                <span className="text-xs font-bold text-slate-600">/ 每月 (自動續訂)</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500">
                {entitlement.isPro 
                  ? '🎉 目前方案：Pro 專業版會員 (已生效)' 
                  : '隨時可至 Apple ID 取消 · App Store 自動續訂'}
              </p>

              {/* 原生連接狀態 */}
              <div className="pt-0.5">
                {isNativeAvailable ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    已連接 iOS StoreKit 2 原生付費
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                    尚未連接 Apple App Store (Web 預覽環境)
                  </span>
                )}
              </div>
            </div>

            {/* 訊息反饋提示 */}
            {message && (
              <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* 按鈕組 */}
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                稍後再說
              </button>
              {entitlement.isPro ? (
                <button
                  disabled
                  className="flex-1 py-3 bg-slate-200 text-slate-600 font-black rounded-2xl text-sm cursor-default"
                >
                  已是 Pro 會員
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className={`flex-1 py-3 text-black font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    isNativeAvailable
                      ? 'bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98]'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isNativeAvailable ? (
                    <span>立即訂閱 Pro</span>
                  ) : (
                    <span>App Store 購買 (需原生環境)</span>
                  )}
                </button>
              )}
            </div>

            {/* 恢復購買按鈕 */}
            {!entitlement.isPro && (
              <div className="text-center pt-0.5">
                <button
                  onClick={handleRestore}
                  disabled={isLoading}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors underline"
                >
                  {isLoading ? '處理中...' : '恢復已購買的訂閱 (Restore Purchases)'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
