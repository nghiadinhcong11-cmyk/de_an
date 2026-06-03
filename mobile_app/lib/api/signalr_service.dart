import 'package:flutter/foundation.dart';
import 'package:signalr_netcore/signalr_client.dart';
import '../utils/constants.dart';

class SignalRService {
  HubConnection? _hubConnection;
  final Function(dynamic) onNewOrder;

  SignalRService({required this.onNewOrder});

  Future<void> init(String token) async {
    _hubConnection = HubConnectionBuilder()
        .withUrl(
          AppConstants.signalRUrl,
          options: HttpConnectionOptions(
            accessTokenFactory: () async => token,
          ),
        )
        .withAutomaticReconnect()
        .build();

    _hubConnection?.on('ReceiveNewOrderRequest', (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        onNewOrder(arguments[0]);
      }
    });

    try {
      await _hubConnection?.start();
      debugPrint('SignalR Connected');
    } catch (e) {
      debugPrint('SignalR Connection Error: $e');
    }
  }

  void stop() {
    _hubConnection?.stop();
  }
}
