import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../api/signalr_service.dart';
import '../api/notification_service.dart';
import '../models/order_request.dart';
import '../models/dining_table.dart';
import '../models/order.dart';
import '../models/product.dart';

class OrderProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final List<OrderRequest> _requests = [];
  List<DiningTable> _tables = [];
  List<OrderModel> _orders = [];
  List<Product> _products = [];
  Map<String, dynamic>? _shiftSummary;
  bool _isLoading = false;
  SignalRService? _signalRService;

  List<OrderRequest> get requests => _requests;
  List<DiningTable> get tables => _tables;
  List<OrderModel> get orders => _orders;
  List<Product> get products => _products;
  Map<String, dynamic>? get shiftSummary => _shiftSummary;
  bool get isLoading => _isLoading;

  Future<void> fetchShiftSummary() async {
    try {
      final response = await _apiService.dio.get(
        '/reports/today-shift-summary',
      );
      if (response.statusCode == 200) {
        _shiftSummary = response.data;
      } else {
        _shiftSummary = _getDefaultSummary();
      }
    } catch (e) {
      debugPrint(
        'Error fetching shift summary (likely 404 or not deployed): $e',
      );
      _shiftSummary = _getDefaultSummary();
    }
    notifyListeners();
  }

  Map<String, dynamic> _getDefaultSummary() {
    return {
      'totalRevenue': 0.0,
      'totalOrders': 0,
      'cashRevenue': 0.0,
      'qrRevenue': 0.0,
    };
  }

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.get('/menu/products');
      if (response.statusCode == 200) {
        _products = (response.data as List)
            .map((e) => Product.fromJson(e))
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching products: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createManualOrder(
    String tableId,
    List<Map<String, dynamic>> items,
  ) async {
    try {
      final response = await _apiService.dio.post(
        '/orders',
        data: {'tableId': tableId, 'items': items},
      );
      if (response.statusCode == 200) {
        fetchTables();
        fetchAllOrders();
        return true;
      }
    } catch (e) {
      debugPrint('Error creating manual order: $e');
    }
    return false;
  }

  Future<void> fetchRequests() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.get(
        '/orders/pending-confirmation',
      );
      if (response.statusCode == 200) {
        _orders = (response.data as List)
            .map((e) => OrderModel.fromJson(e))
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching requests: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> confirmOrder(String orderId) async {
    try {
      final response = await _apiService.dio.post('/orders/$orderId/confirm');
      if (response.statusCode == 200) {
        _orders.removeWhere((o) => o.id == orderId);
        fetchTables();
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error confirming order: $e');
    }
    return false;
  }

  Future<void> fetchAllOrders() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.get('/orders');
      if (response.statusCode == 200) {
        _orders = (response.data as List)
            .map((e) => OrderModel.fromJson(e))
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching all orders: $e');
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
        _tables = (response.data as List)
            .map((e) => DiningTable.fromJson(e))
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching tables: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  void initSignalR(String token, String branchId) {
    if (_signalRService != null) return; // Đã khởi tạo dịch vụ

    _signalRService = SignalRService(
      onNewOrder: (data) {
        // Hiển thị thông báo ngay lập tức
        final zoneInfo = data['zoneName'] != null
            ? ' (${data['zoneName']})'
            : '';
        NotificationService.showLocalNotification(
          title: '🔔 Yêu cầu mới!',
          body: 'Bàn ${data['tableNumber']}$zoneInfo vừa gửi yêu cầu gọi món.',
        );

        fetchRequests();
        fetchTables();
        fetchAllOrders();
      },
      onNewBooking: (data) {
        final tableInfo = data['tableInfo'] != null ? ' tại ${data['tableInfo']}' : '';
        final guests = data['numberOfGuests'] ?? 0;
        NotificationService.showLocalNotification(
          title: '📅 Lịch đặt bàn mới!',
          body: 'Khách ${data['customerName']}$tableInfo ($guests người) đặt lúc ${data['bookingDate']}. Mã: ${data['bookingId'].toString().substring(0, 8).toUpperCase()}',
        );
      },
    );

    _signalRService?.init(token).then((_) {
      _signalRService?.joinBranchGroup(branchId);
    });
  }

  Future<bool> approveRequest(String requestId) async {
    try {
      final response = await _apiService.dio.post(
        '/orders/approve-request/$requestId',
      );
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
      final response = await _apiService.dio.post(
        '/orders/reject-request/$requestId',
      );
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
        final orders = (response.data as List)
            .map((e) => OrderModel.fromJson(e))
            .toList();
        // Tìm đơn hàng đang hoạt động (không phải Completed/Cancelled) tại bàn này
        return orders.firstWhere(
          (o) =>
              o.status != 'Completed' &&
              o.status != 'Cancelled', // Cần lọc theo tableId nếu API hỗ trợ
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
        for (var o in orders) {
          if (o['tableId'] == tableId && o['status'] != 'Completed') {
            return OrderModel.fromJson(o);
          }
        }
      }
    } catch (e) {
      debugPrint('Error fetching order by table id: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> processPayment(
    String orderId,
    String? phoneNumber,
    String? customerName,
    String method,
    String? voucherCode,
  ) async {
    try {
      final response = await _apiService.dio.post(
        '/orders/$orderId/payment',
        data: {
          'phoneNumber': phoneNumber,
          'customerName': customerName,
          'method': method,
          'voucherCode': voucherCode,
        },
      );
      if (response.statusCode == 200) {
        fetchTables();
        fetchAllOrders();
        fetchShiftSummary();
        return response.data;
      }
    } catch (e) {
      debugPrint('Error processing payment: $e');
    }
    return null;
  }

  Future<bool> addItemsToOrder(
    String orderId,
    List<Map<String, dynamic>> items,
  ) async {
    try {
      final response = await _apiService.dio.post(
        '/orders/$orderId/items',
        data: items,
      );
      if (response.statusCode == 200) {
        fetchAllOrders();
        return true;
      }
    } catch (e) {
      debugPrint('Error adding items to order: $e');
    }
    return false;
  }

  @override
  void dispose() {
    _signalRService?.stop();
    super.dispose();
  }
}
