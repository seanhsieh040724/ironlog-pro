# IronLog iOS 原生專案 (WKWebView + StoreKit 2)

本目錄包含 IronLog 的 iOS 原生包裝與 StoreKit 2 訂閱架構。

## 專案架構

```
ios/
├── IronLog.xcodeproj/               # Xcode 專案檔案 (支援 Xcode 15+)
│   ├── project.pbxproj
│   └── xcshareddata/xcschemes/IronLog.xcscheme  (已綁定本地 StoreKit 測試設定)
└── IronLog/
    ├── IronLogApp.swift             # SwiftUI @main 入口
    ├── ContentView.swift            # WKWebView 容器，注入 StoreKit 與推播 Bridge
    ├── StoreKitManager.swift        # StoreKit 2 核心管理類別
    ├── WebViewBridge.swift          # React ↔ Swift 雙向通訊橋接
    ├── NotificationManager.swift    # 倒數計時本機推播
    ├── IronLogProducts.storekit     # Xcode 本機沙盒測試訂閱設定檔
    └── Info.plist                   # 權限聲明與 App 設定
```

## 功能規格

1. **StoreKit 2 原生訂閱**
   - **Product ID**：`com.ironlog.pro.monthly`
   - **Bundle Identifier**：`com.ironlog.pro`
   - **交易監聽**：使用 `Transaction.updates` 背景監聽續約與購買事件。
   - **有效權益驗證**：使用 `Transaction.currentEntitlements` 驗證 JWS 數位簽名，過期或被撤銷時自動降級為一般會員。
   - **交易完成確認**：呼叫 `transaction.finish()` 結束交易生命週期。
   - **恢復購買**：呼叫 `AppStore.sync()`。

2. **React ↔ Swift 雙向 Bridge**
   - **React → Native** (`window.webkit.messageHandlers.storeKitHandler.postMessage`):
     - `getProducts`: 查詢商品清單
     - `purchase`: 喚起原生購買確認框
     - `restorePurchases`: 執行恢復購買
     - `getCurrentEntitlements`: 查詢目前會員權益
   - **Native → React** (`window.__IRONLOG_STOREKIT_CALLBACK__`):
     - `products`
     - `purchaseResult`
     - `restoreResult`
     - `entitlementUpdated`
     - `error`

3. **Xcode Sandbox 測試方式**
   1. 使用 macOS 的 Xcode 打開 `ios/IronLog.xcodeproj`。
   2. 選擇「IronLog」Scheme，點選選單 **Product > Scheme > Edit Scheme...**。
   3. 在 **Run > Options > StoreKit Configuration** 確認已選取 `IronLogProducts.storekit`。
   4. 執行模擬器，進入設定點擊「每月 NT$100 立即解鎖」，即可無須 App Store 憑據直接測試購買、取消與恢復訂閱。
