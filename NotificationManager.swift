import Foundation
import UserNotifications
import WebKit
#if canImport(UIKit)
import UIKit
#endif

/**
 * NotificationManager.swift
 * 
 * 處理計時器倒數結束之本機推播通知與原生觸覺回饋
 * 支援前景橫幅與音效、背景定時推播、以及取消與重新計時生命週期
 */
@MainActor
public final class NotificationManager: NSObject, WKScriptMessageHandler, UNUserNotificationCenterDelegate {
    public static let shared = NotificationManager()
    public static let restTimerNotificationId = "rest-timer-end"
    
    #if canImport(UIKit)
    private let selectionFeedback = UISelectionFeedbackGenerator()
    private let lightImpactFeedback = UIImpactFeedbackGenerator(style: .light)
    #endif
    
    private override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }
    
    // 請求權限（避免重複請求已授權的使用者）
    public func requestPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            switch settings.authorizationStatus {
            case .authorized, .provisional:
                print("[NotificationManager] Notification already authorized: \(settings.authorizationStatus.rawValue)")
            case .notDetermined:
                UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
                    if granted {
                        print("[NotificationManager] Permission granted")
                    } else if let error = error {
                        print("[NotificationManager] Permission error: \(error.localizedDescription)")
                    } else {
                        print("[NotificationManager] Permission denied by user")
                    }
                }
            case .denied:
                print("[NotificationManager] Notification permission was previously denied by user")
            @unknown default:
                break
            }
        }
    }
    
    // 處理來自 JavaScript 的訊息
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "notificationHandler",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { 
            print("[NotificationManager] Invalid message or missing action")
            return 
        }
        
        Task { @MainActor [weak self] in
            self?.handleAction(action: action, body: body)
        }
    }
    
    private func handleAction(action: String, body: [String: Any]) {
        switch action {
        case "requestPermission":
            requestPermission()
            
        case "schedule":
            let rawTitle = (body["title"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
            let actualTitle = (rawTitle?.isEmpty == false) ? rawTitle! : "耶巴蒂"
            
            let rawBody = (body["body"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
            let actualBody = (rawBody?.isEmpty == false) ? rawBody! : "組間休息結束！該開始下一組了！"
            
            // 安全解析 seconds 或 delay，相容 NSNumber、Double、Int 等類型
            var delaySeconds: Double = 0
            if let num = body["seconds"] as? NSNumber {
                delaySeconds = num.doubleValue
            } else if let num = body["delay"] as? NSNumber {
                delaySeconds = num.doubleValue
            } else if let d = body["seconds"] as? Double {
                delaySeconds = d
            } else if let d = body["delay"] as? Double {
                delaySeconds = d
            } else if let i = body["seconds"] as? Int {
                delaySeconds = Double(i)
            } else if let i = body["delay"] as? Int {
                delaySeconds = Double(i)
            }
            
            guard delaySeconds > 0 else {
                print("[NotificationManager] Warning: Invalid or zero delay received (\(delaySeconds)). Payload: \(body)")
                return
            }
            
            scheduleNotification(title: actualTitle, body: actualBody, delay: delaySeconds)
            
        case "cancel":
            cancelAllNotifications()
            
        case "haptic":
            #if canImport(UIKit)
            let style = body["style"] as? String ?? "selection"
            if style == "selection" {
                selectionFeedback.prepare()
                selectionFeedback.selectionChanged()
            } else if style == "medium" {
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.prepare()
                generator.impactOccurred()
            } else {
                lightImpactFeedback.prepare()
                lightImpactFeedback.impactOccurred()
            }
            #endif
            
        default:
            print("[NotificationManager] Unknown action received: \(action)")
            break
        }
    }
    
    // 預約通知
    private func scheduleNotification(title: String, body: String, delay: Double) {
        guard delay > 0 else {
            print("[NotificationManager] Aborted scheduling: delay must be > 0 (received \(delay))")
            return
        }
        
        // 排程前先取消舊的 rest-timer-end 通知，確保只有最新一個計時器有效
        cancelAllNotifications()
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        if #available(iOS 15.0, *) {
            content.interruptionLevel = .timeSensitive
        }
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        let request = UNNotificationRequest(
            identifier: NotificationManager.restTimerNotificationId,
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[NotificationManager] Error scheduling notification: \(error.localizedDescription)")
            } else {
                print("[NotificationManager] Successfully scheduled notification for \(delay)s later [\(title): \(body)]")
            }
        }
    }
    
    // 取消通知（僅取消組間休息計時器專用 ID，不影響 App 其他潛在通知）
    public func cancelAllNotifications() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [NotificationManager.restTimerNotificationId])
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: [NotificationManager.restTimerNotificationId])
        print("[NotificationManager] Cancelled pending rest timer notification (\(NotificationManager.restTimerNotificationId))")
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    // 確保 App 位於前景（Foreground）時仍能彈出橫幅、發出音效與更新列表
    nonisolated public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .list, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
    
    nonisolated public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        completionHandler()
    }
}
