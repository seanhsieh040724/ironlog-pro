import Foundation
import UserNotifications
import WebKit

/**
 * NotificationManager.swift
 * 處理計時器倒數結束之本機推播通知
 */
@MainActor
public final class NotificationManager: NSObject, WKScriptMessageHandler {
    public static let shared = NotificationManager()
    
    // 請求權限
    public func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("[NotificationManager] Permission granted")
            } else if let error = error {
                print("[NotificationManager] Permission error: \(error.localizedDescription)")
            }
        }
    }
    
    // 處理來自 JavaScript 的訊息
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "notificationHandler",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        
        Task { @MainActor [weak self] in
            self?.handleAction(action: action, body: body)
        }
    }
    
    private func handleAction(action: String, body: [String: Any]) {
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
        
        cancelAllNotifications()
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        let request = UNNotificationRequest(identifier: "rest-timer-end", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[NotificationManager] Error scheduling notification: \(error.localizedDescription)")
            }
        }
    }
    
    // 取消通知
    private func cancelAllNotifications() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["rest-timer-end"])
    }
}
