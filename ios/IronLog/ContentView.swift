import SwiftUI
import WebKit

struct ContentView: View {
    // 預設可切換載入本機開發伺服器或打包靜態網頁
    @State private var webAppURL: URL = {
        #if DEBUG
        // 開發環境預設網址 (可根據實際部署或本機埠修改)
        if let url = URL(string: "https://ais-dev-nleeauluuw4jalqbcojlpq-78996542335.asia-northeast1.run.app") {
            return url
        }
        #endif
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

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // 更新時不重複 load
    }
}

#Preview {
    ContentView()
}
