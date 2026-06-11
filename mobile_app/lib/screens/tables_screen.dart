import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import '../models/dining_table.dart';
import 'order_details_screen.dart';

class TablesScreen extends StatefulWidget {
  const TablesScreen({super.key});

  @override
  State<TablesScreen> createState() => _TablesScreenState();
}

class _TablesScreenState extends State<TablesScreen> {
  bool _isMapView = false;

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
    final groupedBranches = _getGroupedBranches(orderProvider.tables);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => setState(() => _isMapView = !_isMapView),
        backgroundColor: const Color(0xFFEA580C),
        icon: Icon(_isMapView ? Icons.list_alt_rounded : Icons.map_outlined, color: Colors.white),
        label: Text(_isMapView ? 'DANH SÁCH' : 'SƠ ĐỒ BÀN', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: orderProvider.fetchTables,
        child: orderProvider.isLoading && orderProvider.tables.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                itemCount: groupedBranches.length,
                itemBuilder: (context, index) {
                  final branchGroup = groupedBranches[index];
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: const Color(0xFFEA580C),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              branchGroup.branchName.toUpperCase(),
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.5, color: Colors.black87),
                            ),
                          ],
                        ),
                      ),
                      ...branchGroup.zones.map((zone) => Theme(
                        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          initiallyExpanded: true,
                          leading: Icon(_isMapView ? Icons.map : Icons.layers_outlined, size: 20, color: const Color(0xFFEA580C)),
                          title: Text(
                            zone.zoneName,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: Colors.black87,
                            ),
                          ),
                          subtitle: Text(
                            '${zone.tables.length} bàn',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade400, fontWeight: FontWeight.bold),
                          ),
                          children: [
                            _isMapView 
                              ? _buildZoneMap(zone, orderProvider)
                              : _buildZoneList(zone, orderProvider),
                            const SizedBox(height: 16),
                          ],
                        ),
                      )),
                    ],
                  );
                },
              ),
      ),
    );
  }

  Widget _buildZoneList(_ZoneGroup zone, OrderProvider orderProvider) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.9,
      ),
      itemCount: zone.tables.length,
      itemBuilder: (context, tIndex) {
        final table = zone.tables[tIndex];
        return _buildTableItem(table, orderProvider);
      },
    );
  }

  Widget _buildZoneMap(_ZoneGroup zone, OrderProvider orderProvider) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      height: 400,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Stack(
            children: [
              // Lưới nền mờ
              Positioned.fill(
                child: Opacity(
                  opacity: 0.05,
                  child: CustomPaint(painter: GridPainter()),
                ),
              ),
              ...zone.tables.map((table) {
                return Positioned(
                  left: (table.posX / 100) * constraints.maxWidth,
                  top: (table.posY / 100) * constraints.maxHeight,
                  child: _buildTableMapItem(table, orderProvider),
                );
              }),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTableItem(DiningTable table, OrderProvider orderProvider) {
    final bool isOccupied = table.status == 'Occupied';
    return InkWell(
      onTap: () => _handleTableTap(table, orderProvider),
      child: Container(
        decoration: BoxDecoration(
          color: isOccupied ? const Color(0xFFEA580C) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            if (!isOccupied) BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4)),
            if (isOccupied) BoxShadow(color: const Color(0xFFEA580C).withAlpha(40), blurRadius: 12, offset: const Offset(0, 6)),
          ],
          border: isOccupied ? null : Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chair_rounded, size: 24, color: isOccupied ? Colors.white24 : Colors.grey.shade200),
            const SizedBox(height: 4),
            Text(
              table.tableNumber,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: isOccupied ? Colors.white : Colors.black,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isOccupied ? Colors.white.withAlpha(40) : Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                isOccupied ? 'CÓ KHÁCH' : 'TRỐNG',
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w900,
                  color: isOccupied ? Colors.white : Colors.green.shade700,
                  letterSpacing: 0.5
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTableMapItem(DiningTable table, OrderProvider orderProvider) {
    final bool isOccupied = table.status == 'Occupied';
    return InkWell(
      onTap: () => _handleTableTap(table, orderProvider),
      child: Container(
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: isOccupied ? const Color(0xFFEA580C) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: isOccupied ? const Color(0xFFEA580C).withAlpha(60) : Colors.black.withAlpha(10),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: isOccupied ? null : Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              table.tableNumber,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.black,
                color: isOccupied ? Colors.white : Colors.black,
              ),
            ),
            Icon(
              isOccupied ? Icons.fireplace_rounded : Icons.chair_rounded,
              size: 20,
              color: isOccupied ? Colors.white.withAlpha(80) : Colors.grey.shade100,
            ),
          ],
        ),
      ),
    );
  }

  void _handleTableTap(DiningTable table, OrderProvider orderProvider) async {
    if (table.status == 'Occupied') {
      final order = await orderProvider.getOrderByTableId(table.id);
      if (order != null && mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => OrderDetailsScreen(order: order)),
        );
      }
    }
  }

  List<_BranchGroup> _getGroupedBranches(List<DiningTable> tables) {
    // Logic nhóm bàn theo branch và zone
    final groups = <String, _BranchGroup>{};
    
    for (var table in tables) {
      final branchName = table.branchName ?? "Chi nhánh";
      final zoneName = table.zoneName ?? "Chung";
      
      if (!groups.containsKey(branchName)) {
        groups[branchName] = _BranchGroup(branchName: branchName, zones: []);
      }
      
      var zone = groups[branchName]!.zones.firstWhere(
        (z) => z.zoneName == zoneName,
        orElse: () {
          final newZone = _ZoneGroup(zoneName: zoneName, tables: []);
          groups[branchName]!.zones.add(newZone);
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

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    var paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 1;

    for (var i = 0; i <= size.width; i += 20) {
      canvas.drawLine(Offset(i.toDouble(), 0), Offset(i.toDouble(), size.height), paint);
    }

    for (var i = 0; i <= size.height; i += 20) {
      canvas.drawLine(Offset(0, i.toDouble()), Offset(size.width, i.toDouble()), paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
