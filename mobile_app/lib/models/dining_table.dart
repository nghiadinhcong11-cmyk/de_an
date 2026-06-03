class DiningTable {
  final String id;
  final String tableNumber;
  final String? zone;
  final int capacity;
  final String status; // Available, Occupied

  DiningTable({
    required this.id,
    required this.tableNumber,
    this.zone,
    required this.capacity,
    required this.status,
  });

  factory DiningTable.fromJson(Map<String, dynamic> json) {
    return DiningTable(
      id: json['id'],
      tableNumber: json['tableNumber'],
      zone: json['zone'],
      capacity: json['capacity'] ?? 4,
      status: json['status'] ?? 'Available',
    );
  }
}
