class DiningTable {
  final String id;
  final String tableNumber;
  final int capacity;
  final String status; // Available, Occupied

  DiningTable({
    required this.id,
    required this.tableNumber,
    required this.capacity,
    required this.status,
  });

  factory DiningTable.fromJson(Map<String, dynamic> json) {
    return DiningTable(
      id: json['id'],
      tableNumber: json['tableNumber'],
      capacity: json['capacity'] ?? 4,
      status: json['status'] ?? 'Available',
    );
  }
}
