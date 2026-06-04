import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import '../models/order.dart';
import 'order_details_screen.dart';

class OrdersListScreen extends StatefulWidget {
  const OrdersListScreen({super.key});

  @override
  State<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends State<OrdersListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchAllOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: RefreshIndicator(
        onRefresh: orderProvider.fetchAllOrders,
        child: orderProvider.isLoading && orderProvider.orders.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : orderProvider.orders.isEmpty
                ? const Center(child: Text('Chưa có đơn hàng nào'))
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: orderProvider.orders.length,
                    itemBuilder: (context, index) {
                      final order = orderProvider.orders[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          onTap: () {
                            if (order.status != 'Completed') {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => OrderDetailsScreen(order: order)),
                              );
                            }
                          },
                          leading: Container(
                            width: 54,
                            height: 54,
                            decoration: BoxDecoration(
                              color: _getStatusColor(order.status).withAlpha(30),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Center(
                              child: Text(
                                order.tableNumber.replaceAll('Bàn ', ''),
                                style: TextStyle(color: _getStatusColor(order.status), fontWeight: FontWeight.w900, fontSize: 18),
                              ),
                            ),
                          ),
                          title: Row(
                            children: [
                              Text(
                                '#${order.orderNumber.split('-').last}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                              ),
                              const SizedBox(width: 8),
                              if (order.paymentStatus == 'Paid')
                                const Icon(Icons.verified_rounded, color: Colors.green, size: 14),
                            ],
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(order.status).withAlpha(20),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    _getStatusText(order.status).toUpperCase(),
                                    style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: _getStatusColor(order.status), letterSpacing: 0.5),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '\$${order.totalAmount.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.black),
                              ),
                              const Text('Tổng cộng', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Preparing': return Colors.blue;
      case 'Ready': return Colors.orange;
      case 'Served': return Colors.green;
      case 'Completed': return Colors.grey;
      default: return Colors.black;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'Preparing': return 'Đang chế biến';
      case 'Ready': return 'Chờ phục vụ';
      case 'Served': return 'Đã phục vụ';
      case 'Completed': return 'Hoàn tất';
      default: return status;
    }
  }
}
