import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../api/signalr_service.dart';
import '../models/order_request.dart';

class OrderProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<OrderRequest> _requests = [];
  bool _isLoading = false;
  SignalRService? _signalRService;

  List<OrderRequest> get requests => _requests;
  bool get isLoading => _isLoading;

  Future<void> fetchRequests() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.dio.get('/orders/pending-requests');
      if (response.statusCode == 200) {
        _requests = (response.data as List)
            .map((e) => OrderRequest.fromJson(e))
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching requests: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void initSignalR(String token) {
    _signalRService = SignalRService(onNewOrder: (data) {
      // Khi có thông báo mới, ta có thể fetch lại toàn bộ hoặc add thêm
      fetchRequests();
    });
    _signalRService?.init(token);
  }

  Future<bool> approveRequest(String requestId) async {
    try {
      final response = await _apiService.dio.post('/orders/approve-request/$requestId');
      if (response.statusCode == 200) {
        _requests.removeWhere((r) => r.id == requestId);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error approving request: $e');
    }
    return false;
  }

  Future<bool> rejectRequest(String requestId) async {
    try {
      final response = await _apiService.dio.post('/orders/reject-request/$requestId');
      if (response.statusCode == 200) {
        _requests.removeWhere((r) => r.id == requestId);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error rejecting request: $e');
    }
    return false;
  }

  @override
  void dispose() {
    _signalRService?.stop();
    super.dispose();
  }
}
