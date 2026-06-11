import 'package:flutter/foundation.dart';
import 'package:signalr_netcore/signalr_client.dart';
import '../utils/constants.dart';

class SignalRService {
  HubConnection? _hubConnection;
  final Function(dynamic) onNewOrder;
  final Function(dynamic)? onNewBooking;

  SignalRService({required this.onNewOrder, this.onNewBooking});

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

    _hubConnection?.on('NewBookingReceived', (arguments) {
      if (arguments != null && arguments.isNotEmpty && onNewBooking != null) {
        onNewBooking!(arguments[0]);
      }
    });

    try {
      await _hubConnection?.start();
      debugPrint('SignalR Connected');
    } catch (e) {
      debugPrint('SignalR Connection Error: $e');
    }
  }

  Future<void> joinBranchGroup(String branchId) async {
    if (_hubConnection?.state == HubConnectionState.Connected) {
      try {
        await _hubConnection?.invoke('JoinBranchGroup', args: [branchId]);
        debugPrint('Joined branch group: $branchId');
      } catch (e) {
        debugPrint('Error joining branch group: $e');
      }
    }
  }

  void stop() {
    _hubConnection?.stop();
  }
}
