import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import 'order_details_screen.dart';

class TablesScreen extends StatefulWidget {
  const TablesScreen({super.key});

  @override
  State<TablesScreen> createState() => _TablesScreenState();
}

class _TablesScreenState extends State<TablesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchTables();
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: RefreshIndicator(
        onRefresh: orderProvider.fetchTables,
        child: orderProvider.isLoading && orderProvider.tables.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _getGroupedBranches(orderProvider.tables).length,
                itemBuilder: (context, index) {
                  final branchGroup = _getGroupedBranches(orderProvider.tables)[index];
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 4,
                              height: 20,
                              decoration: BoxDecoration(
                                color: Colors.orange.shade600,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              branchGroup.branchName,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
                            ),
                          ],
                        ),
                      ),
                      ...branchGroup.zones.map((zone) => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(left: 12, bottom: 12),
                            child: Text(
                              zone.zoneName.toUpperCase(),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey.shade500,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1,
                            ),
                            itemCount: zone.tables.length,
                            itemBuilder: (context, tIndex) {
                              final table = zone.tables[tIndex];
                              final bool isOccupied = table.status == 'Occupied';

                              return InkWell(
                                onTap: () async {
                                  if (isOccupied) {
                                    final order = await orderProvider.getOrderByTableId(table.id);
                                    if (order != null && context.mounted) {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (context) => OrderDetailsScreen(order: order)),
                                      );
                                    }
                                  }
                                },
                                child: Card(
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  color: isOccupied ? Colors.orange.shade600 : Colors.white,
                                  elevation: 0,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        table.tableNumber,
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.black,
                                          color: isOccupied ? Colors.white : Colors.black,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Icon(
                                        Icons.circle,
                                        size: 8,
                                        color: isOccupied ? Colors.white70 : Colors.green.shade400,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 20),
                        ],
                      )),
                    ],
                  );
                },
              ),
      ),
    );
  }

  List<_BranchGroup> _getGroupedBranches(List<DiningTable> tables) {
    // Logic nhóm bàn theo branch và zone
    final groups = <String, _BranchGroup>{};
    
    for (var table in tables) {
      // Giả sử DiningTable model có thêm branchName hoặc ta map qua id
      // Để đơn giản, tôi dùng ID làm tên nếu thiếu
      final branchId = "Chi nhánh"; // Trong thực tế nên lấy tên branch
      final zoneName = table.zone ?? "Chung";
      
      if (!groups.containsKey(branchId)) {
        groups[branchId] = _BranchGroup(branchName: branchId, zones: []);
      }
      
      var zone = groups[branchId]!.zones.firstWhere(
        (z) => z.zoneName == zoneName,
        orElse: () {
          final newZone = _ZoneGroup(zoneName: zoneName, tables: []);
          groups[branchId]!.zones.add(newZone);
          return newZone;
        },
      );
      
      zone.tables.add(table);
    }
    
    return groups.values.toList();
  }
}

class _BranchGroup {
  final String branchName;
  final List<_ZoneGroup> zones;
  _BranchGroup({required this.branchName, required this.zones});
}

class _ZoneGroup {
  final String zoneName;
  final List<DiningTable> tables;
  _ZoneGroup({required this.zoneName, required this.tables});
}
