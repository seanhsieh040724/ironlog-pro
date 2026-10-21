import Foundation
import WebKit
import Security

/**
 * WebViewBridge
 * 
 * 專職負責 React (WKWebView) ↔ Swift (StoreKitManager) 雙向通訊：
 * 
 * React → Native:
 * - getProducts
 * - purchase
 * - restorePurchases
 * - getCurrentEntitlements
 * 
 * Native → React:
 * - products
 * - purchaseResult
 * - entitlementUpdated
 * - restoreResult
 * - error
 */
@MainActor
public final class WebViewBridge: NSObject, WKScriptMessageHandler {
    public static let shared = WebViewBridge()
    
    public weak var webView: WKWebView?
    
    private override init() {
        super.init()
        setupEntitlementObserver()
    }
    
    // 綁定 StoreKitManager 的會員權益推播
    private func setupEntitlementObserver() {
        StoreKitManager.shared.onEntitlementUpdated = { [weak self] entitlement in
            self?.sendCallbackToJS(payload: [
                "action": "entitlement_updated",
                "data": entitlement.toDictionary()
            ])
        }
    }
    
    // MARK: - WKScriptMessageHandler
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "storeKitHandler" else { return }
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else {
            print("[WebViewBridge] Invalid message body")
            return
        }
        
        let requestId = body["requestId"] as? String
        
        Task { @MainActor [weak self] in
            await self?.handleAction(action: action, requestId: requestId, payload: body)
        }
    }
    
    // MARK: - 處理 React 端呼叫的 Actions
    private func handleAction(action: String, requestId: String?, payload: [String: Any]) async {
        switch action {
        case "getProducts":
            do {
                let productIds = payload["productIds"] as? [String] ?? [StoreKitManager.defaultProProductId]
                let dtos = try await StoreKitManager.shared.fetchProductDTOs(productIds: productIds)
                let dictList = dtos.map { $0.toDictionary() }
                
                sendCallbackToJS(payload: [
                    "action": "products",
                    "requestId": requestId as Any,
                    "data": dictList
                ])
            } catch {
                sendErrorToJS(requestId: requestId, error: error.localizedDescription)
            }
            
        case "purchase":
            do {
                let productId = payload["productId"] as? String ?? StoreKitManager.defaultProProductId
                let result = try await StoreKitManager.shared.purchase(productId: productId)
                
                if result.userCancelled {
                    sendCallbackToJS(payload: [
                        "action": "purchaseResult",
                        "requestId": requestId as Any,
                        "data": [
                            "userCancelled": true
                        ]
                    ])
                } else if let entitlement = result.entitlement {
                    sendCallbackToJS(payload: [
                        "action": "purchaseResult",
                        "requestId": requestId as Any,
                        "data": [
                            "entitlement": entitlement.toDictionary()
                        ]
                    ])
                } else {
                    sendErrorToJS(requestId: requestId, error: "購買流程未完成或正在等待處理")
                }
            } catch {
                sendErrorToJS(requestId: requestId, error: error.localizedDescription)
            }
            
        case "restorePurchases":
            do {
                let entitlement = try await StoreKitManager.shared.restorePurchases()
                sendCallbackToJS(payload: [
                    "action": "restoreResult",
                    "requestId": requestId as Any,
                    "data": [
                        "entitlement": entitlement.toDictionary()
                    ]
                ])
            } catch {
                sendErrorToJS(requestId: requestId, error: error.localizedDescription)
            }
            
        case "getCurrentEntitlements":
            let entitlement = StoreKitManager.shared.currentEntitlement
            sendCallbackToJS(payload: [
                "action": "entitlementUpdated",
                "requestId": requestId as Any,
                "data": entitlement.toDictionary()
            ])
            
        case "getCoachUsageCount":
            let count = getKeychainCoachUsageCount()
            sendCallbackToJS(payload: [
                "action": "coachUsageCount",
                "requestId": requestId as Any,
                "data": [
                    "usedCount": count
                ]
            ])
            
        case "incrementCoachUsageCount":
            let current = getKeychainCoachUsageCount()
            let next = min(current + 1, 10)
            setKeychainCoachUsageCount(next)
            sendCallbackToJS(payload: [
                "action": "coachUsageCountUpdated",
                "requestId": requestId as Any,
                "data": [
                    "usedCount": next
                ]
            ])
            
        default:
            sendErrorToJS(requestId: requestId, error: "未知的 action: \(action)")
        }
    }
    
    // MARK: - AI Coach Quota Keychain Storage (service: com.ironlog.coach, key: ai_usage_count)
    private static let coachKeychainService = "com.ironlog.coach"
    private static let coachUsageCountAccount = "ai_usage_count"
    
    private func getKeychainCoachUsageCount() -> Int {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.coachKeychainService,
            kSecAttrAccount as String: Self.coachUsageCountAccount,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        guard status == errSecSuccess,
              let data = item as? Data,
              let str = String(data: data, encoding: .utf8),
              let count = Int(str) else {
            return 0
        }
        
        return min(max(0, count), 10)
    }
    
    private func setKeychainCoachUsageCount(_ count: Int) {
        let clampedCount = min(max(0, count), 10)
        guard let data = "\(clampedCount)".data(using: .utf8) else { return }
        
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.coachKeychainService,
            kSecAttrAccount as String: Self.coachUsageCountAccount
        ]
        SecItemDelete(deleteQuery as CFDictionary)
        
        let addQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.coachKeychainService,
            kSecAttrAccount as String: Self.coachUsageCountAccount,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        SecItemAdd(addQuery as CFDictionary, nil)
    }
    
    // MARK: - 回傳資料給 React (window.__IRONLOG_STOREKIT_CALLBACK__)
    public func sendCallbackToJS(payload: [String: Any]) {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: payload, options: []),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            print("[WebViewBridge] Failed to serialize JSON payload")
            return
        }
        
        let jsCode = "if (window.__IRONLOG_STOREKIT_CALLBACK__) { window.__IRONLOG_STOREKIT_CALLBACK__(\(jsonString)); }"
        
        self.webView?.evaluateJavaScript(jsCode) { _, error in
            if let error = error {
                print("[WebViewBridge] evaluateJavaScript error: \(error.localizedDescription)")
            }
        }
    }
    
    public func sendErrorToJS(requestId: String?, error: String) {
        var payload: [String: Any] = [
            "action": "error",
            "error": error
        ]
        if let requestId = requestId {
            payload["requestId"] = requestId
        }
        sendCallbackToJS(payload: payload)
    }
}
