import SwiftUI

@main
struct IronLogApp: App {
    // 初始化單例管理器
    @StateObject private var storeKitManager = StoreKitManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(storeKitManager)
                .preferredColorScheme(.dark)
        }
    }
}
