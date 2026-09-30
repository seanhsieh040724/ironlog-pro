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
            .background(Color.white)
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
        UNUserNotificationCenter.current().delegate = notificationManager
        contentController.add(notificationManager, name: "notificationHandler")
        
        // 3. WebKit 偏好設定
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: config)
        
        // 4. 禁用外層 WebView 橡皮筋滑動（防止露出黑邊或拉動整個版面）
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.alwaysBounceHorizontal = false
        
        // 5. 設定為純白背景，消除啟動載入時的黑屏與閃爍
        webView.isOpaque = true
        webView.backgroundColor = .white
        webView.scrollView.backgroundColor = .white
        
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
