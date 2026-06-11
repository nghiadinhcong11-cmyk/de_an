class DiningTable {
  final String id;
  final String tableNumber;
  final String? zoneName;
  final String? branchName;
  final int capacity;
  final String status; // Available, Occupied
  final double posX;
  final double posY;

  DiningTable({
    required this.id,
    required this.tableNumber,
    this.zoneName,
    this.branchName,
    required this.capacity,
    required this.status,
    this.posX = 0,
    this.posY = 0,
  });

  factory DiningTable.fromJson(Map<String, dynamic> json) {
    return DiningTable(
      id: json['id'],
      tableNumber: json['tableNumber'],
      zoneName: json['zoneName'],
      branchName: json['branchName'],
      capacity: json['capacity'] ?? 4,
      status: json['status'] ?? 'Available',
      posX: (json['posX'] ?? 0).toDouble(),
      posY: (json['posY'] ?? 0).toDouble(),
    );
  }
}
