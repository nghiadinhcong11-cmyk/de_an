import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:audioplayers/audioplayers.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();
  static final AudioPlayer _audioPlayer = AudioPlayer();

  static Future<void> init() async {
    // 1. Setup Local Notifications (Mobile Only)
    if (!kIsWeb) {
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/ic_launcher');
      
      const InitializationSettings initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
      );

      await _notificationsPlugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: (details) {
          // Handle notification tap
        },
      );

      // 2. Create Notification Channel (Android)
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        'order_channel',
        'Đơn hàng mới',
        description: 'Thông báo khi có khách gọi món',
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
      );

      await _notificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      // 3. Request Permissions (FCM)
      FirebaseMessaging messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
    }
  }

  static Future<void> playNotificationSound() async {
    try {
      // Sử dụng source từ URL hoặc Assets
      await _audioPlayer.play(UrlSource('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
      debugPrint('Playing notification sound...');
    } catch (e) {
      debugPrint('Error playing sound: $e');
    }
  }

  static Future<void> showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    // Luôn phát âm thanh (cả Web và Mobile)
    playNotificationSound();

    if (!kIsWeb) {
      const AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        'order_channel',
        'Đơn hàng mới',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: true,
        playSound: true,
      );

      const NotificationDetails platformChannelSpecifics =
          NotificationDetails(android: androidPlatformChannelSpecifics);

      await _notificationsPlugin.show(
        DateTime.now().millisecond,
        title,
        body,
        platformChannelSpecifics,
        payload: payload,
      );
    } else {
        // Trên Web nếu k dùng local_notifications thì có thể dùng SnackBar hoặc log
        debugPrint('WEB NOTIFICATION: $title - $body');
    }
  }

  // Lấy Token để gửi lên Server lưu trữ (Dùng cho gửi Push từ Backend)
  static Future<String?> getDeviceToken() async {
    try {
      return await FirebaseMessaging.instance.getToken();
    } catch (e) {
      debugPrint('Error getting token: $e');
      return null;
    }
  }
}
