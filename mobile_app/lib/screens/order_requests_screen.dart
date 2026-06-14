import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import '../utils/currency_util.dart';
import 'bookings_screen.dart';

class OrderRequestsScreen extends StatefulWidget {
  const OrderRequestsScreen({super.key});

  @override
  State<OrderRequestsScreen> createState() => _OrderRequestsScreenState();
}

class _OrderRequestsScreenState extends State<OrderRequestsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF9FAFB),
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: const TabBar(
              dividerColor: Colors.transparent,
              indicatorColor: Color(0xFFEA580C),
              labelColor: Color(0xFFEA580C),
              unselectedLabelColor: Colors.grey,
              labelStyle: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
              unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              tabs: [
                Tab(text: 'MÓN ĂN'),
                Tab(text: 'ĐẶT BÀN'),
              ],
            ),
          ),
        ),
        body: const TabBarView(
          children: [
            _OrdersRequestList(),
            BookingsScreen(),
          ],
        ),
      ),
    );
  }
}

class _OrdersRequestList extends StatelessWidget {
  const _OrdersRequestList();

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final pendingOrders = orderProvider.orders
        .where((o) => o.status == 'PendingConfirmation')
        .toList();

    return RefreshIndicator(
      onRefresh: orderProvider.fetchRequests,
      child: orderProvider.isLoading && pendingOrders.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFEA580C)))
          : pendingOrders.isEmpty
              ? const Center(child: Text('Không có yêu cầu nào mới'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: pendingOrders.length,
                  itemBuilder: (context, index) {
                    final order = pendingOrders[index];
                    return _OrderRequestCard(order: order);
                  },
                ),
    );
  }
}

class _OrderRequestCard extends StatelessWidget {
  final dynamic order;
  const _OrderRequestCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      elevation: 0,
      color: Colors.white,
      child: ExpansionTile(
        shape: const RoundedRectangleBorder(side: BorderSide.none),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFFFF7ED),
          child: Text(
            order.tableNumber.replaceAll('Bàn ', ''),
            style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.w900),
          ),
        ),
        title: Text(
          'Bàn ${order.tableNumber}',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
        ),
        subtitle: Text(
          'Tổng: ${CurrencyUtil.format(order.totalAmount)} • Chờ xác nhận',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Column(
              children: [
                const Divider(height: 1),
                const SizedBox(height: 12),
                ...order.items.map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${item.quantity}x ${item.productName}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          Text(CurrencyUtil.format(item.unitPrice * item.quantity), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                        ],
                      ),
                    )),
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Tổng cộng', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                    Text(
                      CurrencyUtil.format(order.totalAmount),
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFFEA580C)),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(child: _RejectButton(orderId: order.id)),
                    const SizedBox(width: 12),
                    Expanded(flex: 2, child: _ConfirmButton(orderId: order.id)),
                  ],
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RejectButton extends StatefulWidget {
  final String orderId;
  const _RejectButton({required this.orderId});

  @override
  State<_RejectButton> createState() => _RejectButtonState();
}

class _RejectButtonState extends State<_RejectButton> {
  bool _isRejecting = false;

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);

    return SizedBox(
      height: 48,
      child: OutlinedButton(
        onPressed: _isRejecting
            ? null
            : () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Từ chối đơn?'),
                    content: const Text(
                      'Bạn có chắc chắn muốn từ chối yêu cầu này không?',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('HỦY'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text(
                          'TỪ CHỐI',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                );

                if (confirm == true) {
                  setState(() => _isRejecting = true);
                  // Logic từ chối đơn hàng (Cần thêm API hoặc dùng rejectRequest hiện có nếu tương thích)
                  final success = await orderProvider.rejectRequest(
                    widget.orderId,
                  );
                  if (success) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã từ chối đơn hàng')),
                      );
                    }
                  } else {
                    if (mounted) setState(() => _isRejecting = false);
                  }
                }
              },
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Colors.red),
          foregroundColor: Colors.red,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isRejecting
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.red,
                  strokeWidth: 2,
                ),
              )
            : const Text(
                'TỪ CHỐI',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
      ),
    );
  }
}

class _ConfirmButton extends StatefulWidget {
  final String orderId;
  const _ConfirmButton({required this.orderId});

  @override
  State<_ConfirmButton> createState() => _ConfirmButtonState();
}

class _ConfirmButtonState extends State<_ConfirmButton> {
  bool _isConfirming = false;

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);

    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: _isConfirming
            ? null
            : () async {
                setState(() => _isConfirming = true);
                final success = await orderProvider.confirmOrder(
                  widget.orderId,
                );
                if (success) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Đã xác nhận đơn hàng thành công!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } else {
                  if (mounted) setState(() => _isConfirming = false);
                }
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isConfirming
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            : const Text(
                'XÁC NHẬN PHỤC VỤ',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
      ),
    );
  }
}
