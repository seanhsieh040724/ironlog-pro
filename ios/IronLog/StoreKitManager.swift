import Foundation
import StoreKit

/**
 * EntitlementInfo
 * 供原生與 Web 統一使用的會員權益結構
 */
public struct EntitlementInfo: Codable, Equatable {
    public var isPro: Bool
    public var status: String // "active" | "inactive" | "expired" | "revoked" | "pending"
    public var productId: String?
    public var expirationDate: Double? // 毫秒時間戳 (Epoch ms)
    public var willAutoRenew: Bool
    public var isSandbox: Bool
    public var originalPurchaseDate: Double? // 毫秒時間戳 (Epoch ms)

    public static let inactive = EntitlementInfo(
        isPro: false,
        status: "inactive",
        productId: nil,
        expirationDate: nil,
        willAutoRenew: false,
        isSandbox: false,
        originalPurchaseDate: nil
    )
    
    public func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "isPro": isPro,
            "status": status,
            "willAutoRenew": willAutoRenew,
            "isSandbox": isSandbox
        ]
        if let productId = productId { dict["productId"] = productId }
        if let expirationDate = expirationDate { dict["expirationDate"] = expirationDate }
        if let originalPurchaseDate = originalPurchaseDate { dict["originalPurchaseDate"] = originalPurchaseDate }
        return dict
    }
}

/**
 * StoreKitProductDTO
 * 供前端渲染訂閱方案名稱、本地化價格與週期的規格
 */
public struct StoreKitProductDTO: Codable {
    public let id: String
    public let displayName: String
    public let description: String
    public let displayPrice: String
    public let price: Double
    public let currencyCode: String
    public let subscriptionPeriod: SubscriptionPeriodDTO?

    public struct SubscriptionPeriodDTO: Codable {
        public let unit: String // "day" | "week" | "month" | "year"
        public let value: Int
    }
    
    public func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "displayName": displayName,
            "description": description,
            "displayPrice": displayPrice,
            "price": price,
            "currencyCode": currencyCode
        ]
        if let period = subscriptionPeriod {
            dict["subscriptionPeriod"] = [
                "unit": period.unit,
                "value": period.value
            ]
        }
        return dict
    }
}

/**
 * StoreKitManager (StoreKit 2)
 *
 * 職責：
 * 1. Product.products(for:) 查詢產品
 * 2. Product.purchase() 喚起 iOS 系統購買畫面
 * 3. Transaction.currentEntitlements 檢查有效訂閱
 * 4. Transaction.updates 背景交易監聽
 * 5. AppStore.sync() 恢復購買
 * 6. transaction.finish() 結束交易生命週期
 * 7. 判斷目前 Pro entitlement 並提供回調通知
 */
@MainActor
public class StoreKitManager: ObservableObject {
    public static let shared = StoreKitManager()
    
    // 預設訂閱產品 ID
    public static let defaultProProductId = "com.ironlog.pro.monthly"
    
    @Published public private(set) var currentEntitlement: EntitlementInfo = .inactive
    @Published public private(set) var availableProducts: [Product] = []
    
    // 會員狀態更新監聽器
    public var onEntitlementUpdated: ((EntitlementInfo) -> Void)?
    
    private var transactionListenerTask: Task<Void, Never>? = nil

    private init() {
        // 啟動 Transaction.updates 背景監聽器
        transactionListenerTask = listenForTransactions()
        
        // 初始載入當前權益
        Task {
            await updateCustomerProductStatus()
        }
    }
    
    deinit {
        transactionListenerTask?.cancel()
    }
    
    // MARK: - 1. 背景交易監聽 (Transaction.updates)
    private func listenForTransactions() -> Task<Void, Never> {
        Task.detached(priority: .background) {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)
                    
                    // 根據官方要求，處理完畢後必須調用 finish()
                    await transaction.finish()
                    
                    // 重新更新目前有效訂閱並通知 UI
                    await self.updateCustomerProductStatus()
                } catch {
                    print("[StoreKitManager] Transaction update verification failed: \(error)")
                }
            }
        }
    }
    
    // MARK: - 2. 查詢 App Store 商品 (Product.products(for:))
    public func fetchProducts(productIds: [String] = [defaultProProductId]) async throws -> [Product] {
        let products = try await Product.products(for: Set(productIds))
        self.availableProducts = products
        return products
    }
    
    public func fetchProductDTOs(productIds: [String] = [defaultProProductId]) async throws -> [StoreKitProductDTO] {
        let products = try await fetchProducts(productIds: productIds)
        return products.map { product in
            var periodDTO: StoreKitProductDTO.SubscriptionPeriodDTO? = nil
            if let subscription = product.subscription {
                let unitString: String
                switch subscription.subscriptionPeriod.unit {
                case .day: unitString = "day"
                case .week: unitString = "week"
                case .month: unitString = "month"
                case .year: unitString = "year"
                @unknown default: unitString = "month"
                }
                periodDTO = StoreKitProductDTO.SubscriptionPeriodDTO(
                    unit: unitString,
                    value: subscription.subscriptionPeriod.value
                )
            }
            
            let currencyCode = product.priceFormatStyle.currencyCode
            
            return StoreKitProductDTO(
                id: product.id,
                displayName: product.displayName,
                description: product.description,
                displayPrice: product.displayPrice,
                price: NSDecimalNumber(decimal: product.price).doubleValue,
                currencyCode: currencyCode,
                subscriptionPeriod: periodDTO
            )
        }
    }
    
    // MARK: - 3. 喚起 StoreKit 2 系統原生購買 (Product.purchase())
    public func purchase(productId: String = defaultProProductId) async throws -> (success: Bool, userCancelled: Bool, entitlement: EntitlementInfo?) {
        // 先在記憶體中找，找不到則嘗試從 App Store 獲取
        guard let product = availableProducts.first(where: { $0.id == productId }) ?? (try await fetchProducts(productIds: [productId])).first else {
            throw NSError(domain: "StoreKitManager", code: 404, userInfo: [NSLocalizedDescriptionKey: "找不到商品: \(productId)"])
        }
        
        let purchaseResult = try await product.purchase()
        
        switch purchaseResult {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            
            // 交易成功，結束交易
            await transaction.finish()
            
            // 更新狀態
            await updateCustomerProductStatus()
            
            return (success: true, userCancelled: false, entitlement: self.currentEntitlement)
            
        case .userCancelled:
            return (success: false, userCancelled: true, entitlement: nil)
            
        case .pending:
            // 需家長同意 (Ask to Buy) 等等待狀態
            return (success: false, userCancelled: false, entitlement: nil)
            
        @unknown default:
            return (success: false, userCancelled: false, entitlement: nil)
        }
    }
    
    // MARK: - 4. 恢復購買 (AppStore.sync())
    public func restorePurchases() async throws -> EntitlementInfo {
        try await AppStore.sync()
        await updateCustomerProductStatus()
        return self.currentEntitlement
    }
    
    // MARK: - 5. 檢查當前會員權益 (Transaction.currentEntitlements)
    public func updateCustomerProductStatus() async {
        var isProActive = false
        var activeEntitlement: EntitlementInfo = .inactive
        
        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                
                // 檢查是否是 IronLog Pro 商品
                if transaction.productID == Self.defaultProProductId {
                    // 確認未被退款或撤回 (revoked)
                    if transaction.revocationDate == nil {
                        // 檢查到期日 (若有)
                        let isExpired: Bool
                        if let expirationDate = transaction.expirationDate {
                            isExpired = expirationDate < Date()
                        } else {
                            isExpired = false
                        }
                        
                        if !isExpired {
                            isProActive = true
                            
                            var willAutoRenew = true
                            // 讀取訂閱續訂狀態
                            if let subscriptionStatus = try? await transaction.subscriptionStatus {
                                willAutoRenew = subscriptionStatus.renewalInfo.willAutoRenew
                            }
                            
                            activeEntitlement = EntitlementInfo(
                                isPro: true,
                                status: "active",
                                productId: transaction.productID,
                                expirationDate: transaction.expirationDate.map { $0.timeIntervalSince1970 * 1000 },
                                willAutoRenew: willAutoRenew,
                                isSandbox: transaction.environment == .sandbox,
                                originalPurchaseDate: transaction.originalPurchaseDate.timeIntervalSince1970 * 1000
                            )
                            break
                        }
                    }
                }
            } catch {
                print("[StoreKitManager] Failed to verify current entitlement: \(error)")
            }
        }
        
        if !isProActive {
            self.currentEntitlement = .inactive
        } else {
            self.currentEntitlement = activeEntitlement
        }
        
        // 觸發通知回調
        self.onEntitlementUpdated?(self.currentEntitlement)
    }
    
    // MARK: - 6. JWS 憑證簽名校驗 (VerificationResult)
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let safe):
            return safe
        }
    }
}
