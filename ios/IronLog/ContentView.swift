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

    // 原生純白啟動遮罩狀態：在 WebView 首次交付內容前覆蓋於最上層，阻絕一切冷啟動黑屏與載入閃爍
    @State private var isNativeSplashActive = true

    var body: some View {
        ZStack {
            // 底層保障：永遠為純白，防止任何層級未渲染時露出預設底色
            Color.white
                .ignoresSafeArea()

            // 主體 WKWebView
            IronLogWebViewContainer(
                url: webAppURL,
                onInitialRenderReady: {
                    // 網頁開始渲染或載入完成，原生遮罩平滑退場
                    withAnimation(.easeOut(duration: 0.2)) {
                        isNativeSplashActive = false
                    }
                }
            )
            .ignoresSafeArea()
            .opacity(isNativeSplashActive ? 0.01 : 1.0)

            // 原生純白啟動遮罩：確保從 Launch Screen 到 Web Splash 之間無縫銜接
            if isNativeSplashActive {
                Color.white
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .onAppear {
                        // 防超時機制：若網路或載入超過 2 秒，強制退場，絕不卡死 App
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                            if isNativeSplashActive {
                                withAnimation(.easeOut(duration: 0.2)) {
                                    isNativeSplashActive = false
                                }
                            }
                        }
                    }
            }
        }
        .background(Color.white)
        .preferredColorScheme(.light)
    }
}

struct IronLogWebViewContainer: UIViewRepresentable {
    let url: URL
    let onInitialRenderReady: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onInitialRenderReady: onInitialRenderReady)
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        private let onInitialRenderReady: () -> Void
        private var didNotifyReady = false

        init(onInitialRenderReady: @escaping () -> Void) {
            self.onInitialRenderReady = onInitialRenderReady
        }

        @MainActor
        func notifyReadyOnce() {
            guard !didNotifyReady else { return }
            didNotifyReady = true
            onInitialRenderReady()
        }

        // 1. 當遠端或本地網頁內容開始傳輸並 Commit 繪製時
        func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
            Task { @MainActor in
                self.notifyReadyOnce()
            }
        }

        // 2. 當頁面完全載入完成時
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            Task { @MainActor in
                self.notifyReadyOnce()
            }
        }

        // 3. 容錯處理：若導航發生錯誤亦立即釋放遮罩，絕不卡死
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            Task { @MainActor in
                self.notifyReadyOnce()
            }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            Task { @MainActor in
                self.notifyReadyOnce()
            }
        }
    }

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
        
        // 掛載導航監聽以精確捕捉首次內容渲染時機
        webView.navigationDelegate = context.coordinator
        
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
