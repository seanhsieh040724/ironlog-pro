import UserNotifications
import WebKit

/**
 * NotificationManager.swift
 * 
 * 請將此文件內容複製到您的 Xcode 專案中。
 * 並在您的 WKWebView 設定中加入此 MessageHandler：
 * 
 * let contentController = WKUserContentController()
 * contentController.add(NotificationManager.shared, name: "notificationHandler")
 * let config = WKWebViewConfiguration()
 * config.userContentController = contentController
 * let webView = WKWebView(frame: .zero, configuration: config)
 */

class NotificationManager: NSObject, WKScriptMessageHandler {
    static let shared = NotificationManager()
    
    // 請求權限
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Notification permission granted")
            } else if let error = error {
                print("Notification permission error: \(error.localizedDescription)")
            }
        }
    }
    
    // 處理來自 JavaScript 的訊息
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "notificationHandler",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        
        switch action {
        case "requestPermission":
            requestPermission()
        case "schedule":
            let title = body["title"] as? String ?? "IronLog"
            let contentBody = body["body"] as? String ?? "休息結束！"
            let delay = body["delay"] as? Double ?? 0
            scheduleNotification(title: title, body: contentBody, delay: delay)
        case "cancel":
            cancelAllNotifications()
        default:
            break
        }
    }
    
    // 預約通知
    private func scheduleNotification(title: String, body: String, delay: Double) {
        guard delay > 0 else { return }
        
        // 先取消舊的，避免重複
        cancelAllNotifications()
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default // 預設聲音
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        let request = UNNotificationRequest(identifier: "rest-timer-end", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error.localizedDescription)")
            }
        }
    }
    
    // 取消通知
    private func cancelAllNotifications() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["rest-timer-end"])
    }
}
