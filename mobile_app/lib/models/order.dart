class OrderModel {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final double totalAmount;
  final List<OrderItemModel> items;
  final String tableNumber;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.items,
    required this.tableNumber,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      orderNumber: json['orderNumber'],
      status: json['status'],
      paymentStatus: json['paymentStatus'],
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      tableNumber: json['tableNumber'] ?? '??',
      items: (json['items'] as List? ?? [])
          .map((i) => OrderItemModel.fromJson(i))
          .toList(),
    );
  }
}

class OrderItemModel {
  final String productName;
  final int quantity;
  final double unitPrice;

  OrderItemModel({
    required this.productName,
    required this.quantity,
    required this.unitPrice,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productName: json['productName'] ?? json['name'] ?? 'Sản phẩm',
      quantity: json['quantity'] ?? 0,
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
    );
  }
}
