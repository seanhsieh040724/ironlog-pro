import SwiftUI
import WebKit

struct ContentView: View {
    // 統一載入 IronLog Pro 正式 Vercel 網址
    @State private var webAppURL: URL = {
        if let url = URL(string: "https://iron-log-pro.vercel.app") {
            return url
        }
        return Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist") ?? URL(string: "about:blank")!
    }()

    var body: some View {
        IronLogWebViewContainer(url: webAppURL)
            .ignoresSafeArea()
            .background(Color.black)
    }
}

struct IronLogWebViewContainer: UIViewRepresentable {
    let url: URL

    @MainActor
    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        
        // 1. 掛載 StoreKit 2 通訊橋接處理器
        let storeKitBridge = WebViewBridge.shared
        contentController.add(storeKitBridge, name: "storeKitHandler")
        
        // 2. 掛載本地推播處理器 (現有通知功能)
        let notificationManager = NotificationManager.shared
        contentController.add(notificationManager, name: "notificationHandler")
        
        // 3. WebKit 偏好設定
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.bounces = true
        webView.isOpaque = false
        webView.backgroundColor = .black
        
        // 傳遞 webView 參考給 bridge 以便 evaluateJavaScript
        storeKitBridge.webView = webView
        
        // 載入頁面
        let request = URLRequest(url: url)
        webView.load(request)
        
        return webView
    }

    @MainActor
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // 更新時不重複 load
    }
}

#Preview {
    ContentView()
}
