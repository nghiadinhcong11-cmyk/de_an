class OrderRequest {
  final String id;
  final String? tableNumber;
  final String customerName;
  final double totalAmount;
  final List<OrderRequestItem> items;
  final DateTime createdAt;

  OrderRequest({
    required this.id,
    this.tableNumber,
    required this.customerName,
    required this.totalAmount,
    required this.items,
    required this.createdAt,
  });

  factory OrderRequest.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['orderRequestItems'] as List? ?? [])
        .map((i) => OrderRequestItem.fromJson(i))
        .toList();
    
    double total = 0;
    for (var item in itemsList) {
      total += item.price * item.quantity;
    }

    return OrderRequest(
      id: json['id'],
      tableNumber: json['tableNumber'] ?? '??', // Thường backend trả thêm số bàn qua DTO hoặc phải join
      customerName: json['customerName'] ?? 'Khách hàng',
      totalAmount: total,
      items: itemsList,
      createdAt: DateTime.parse(json['createdAtUtc']),
    );
  }
}

class OrderRequestItem {
  final String productName;
  final int quantity;
  final double price;
  final String? note;

  OrderRequestItem({
    required this.productName,
    required this.quantity,
    required this.price,
    this.note,
  });

  factory OrderRequestItem.fromJson(Map<String, dynamic> json) {
    final product = json['product'];
    return OrderRequestItem(
      productName: product != null ? product['name'] : 'Sản phẩm',
      quantity: json['quantity'] ?? 0,
      price: product != null ? (product['price'] ?? 0).toDouble() : 0.0,
      note: json['note'],
    );
  }
}
