import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../api/signalr_service.dart';
import '../models/order_request.dart';
import '../models/dining_table.dart';
import '../models/order.dart';

class OrderProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<OrderRequest> _requests = [];
  List<DiningTable> _tables = [];
  bool _isLoading = false;
  SignalRService? _signalRService;

  List<OrderRequest> get requests => _requests;
  List<DiningTable> get tables => _tables;
  bool get isLoading => _isLoading;

  Future<void> fetchRequests() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.get('/orders/pending-requests');
      if (response.statusCode == 200) {
        _requests = (response.data as List).map((e) => OrderRequest.fromJson(e)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching requests: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchTables() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.get('/tables');
      if (response.statusCode == 200) {
        _tables = (response.data as List).map((e) => DiningTable.fromJson(e)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching tables: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  void initSignalR(String token) {
    _signalRService = SignalRService(onNewOrder: (data) {
      fetchRequests();
      fetchTables();
    });
    _signalRService?.init(token);
  }

  Future<bool> approveRequest(String requestId) async {
    try {
      final response = await _apiService.dio.post('/orders/approve-request/$requestId');
      if (response.statusCode == 200) {
        _requests.removeWhere((r) => r.id == requestId);
        fetchTables();
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

  Future<OrderModel?> getActiveOrderForTable(String tableId) async {
    try {
      final response = await _apiService.dio.get('/orders');
      if (response.statusCode == 200) {
        final orders = (response.data as List).map((e) => OrderModel.fromJson(e)).toList();
        // Tìm đơn hàng đang hoạt động (không phải Completed/Cancelled) tại bàn này
        return orders.firstWhere(
          (o) => o.status != 'Completed' && o.status != 'Cancelled' && o.id != null, // Cần lọc theo tableId nếu API hỗ trợ
          orElse: () => throw Exception('Không tìm thấy đơn hàng'),
        );
      }
    } catch (e) {
      debugPrint('Error getting order: $e');
    }
    return null;
  }

  // Phương thức lấy đơn hàng thực sự theo tableId (giả sử backend có endpoint hoặc ta lọc)
  Future<OrderModel?> getOrderByTableId(String tableId) async {
     try {
      final response = await _apiService.dio.get('/orders');
      if (response.statusCode == 200) {
        final orders = (response.data as List);
        for(var o in orders) {
          if (o['tableId'] == tableId && o['status'] != 'Completed') {
            return OrderModel.fromJson(o);
          }
        }
      }
    } catch (e) {}
    return null;
  }

  Future<Map<String, dynamic>?> processPayment(String orderId, String? phoneNumber, String? customerName) async {
    try {
      final response = await _apiService.dio.post('/orders/$orderId/payment', data: {
        'phoneNumber': phoneNumber,
        'customerName': customerName,
      });
      if (response.statusCode == 200) {
        fetchTables();
        return response.data;
      }
    } catch (e) {
      debugPrint('Error processing payment: $e');
    }
    return null;
  }

  @override
  void dispose() {
    _signalRService?.stop();
    super.dispose();
  }
}
