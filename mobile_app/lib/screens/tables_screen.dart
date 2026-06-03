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
            : GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                ),
                itemCount: orderProvider.tables.length,
                itemBuilder: (context, index) {
                  final table = orderProvider.tables[index];
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
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      color: isOccupied ? Colors.orange.shade600 : Colors.white,
                      elevation: 0,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.table_restaurant,
                            size: 40,
                            color: isOccupied ? Colors.white : Colors.grey,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            table.tableNumber,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.black,
                              color: isOccupied ? Colors.white : Colors.black,
                            ),
                          ),
                          Text(
                            isOccupied ? 'Đang có khách' : 'Bàn trống',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isOccupied ? Colors.white70 : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
