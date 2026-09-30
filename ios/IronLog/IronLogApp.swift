import SwiftUI
import UserNotifications

@main
struct IronLogApp: App {
    // 初始化單例管理器
    @StateObject private var storeKitManager = StoreKitManager.shared

    init() {
        // 設定通知委託與請求授權，確保前景與背景生命週期皆能收到通知
        UNUserNotificationCenter.current().delegate = NotificationManager.shared
        NotificationManager.shared.requestPermission()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(storeKitManager)
                .preferredColorScheme(.dark)
        }
    }
}
