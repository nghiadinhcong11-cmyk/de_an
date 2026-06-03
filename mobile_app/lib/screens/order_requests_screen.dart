import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';

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
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final orderProvider = Provider.of<OrderProvider>(context, listen: false);
      orderProvider.fetchRequests();
      if (auth.token != null) {
        orderProvider.initSignalR(auth.token!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: RefreshIndicator(
        onRefresh: orderProvider.fetchRequests,
        child: orderProvider.isLoading && orderProvider.requests.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : orderProvider.requests.isEmpty
                ? const Center(child: Text('Không có yêu cầu nào mới'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: orderProvider.requests.length,
                    itemBuilder: (context, index) {
                      final request = orderProvider.requests[index];
                      return Card(
                        margin: const EdgeInsets.bottom(16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        elevation: 0,
                        color: Colors.white,
                        child: ExpansionTile(
                          shape: const RoundedRectangleBorder(side: BorderSide.none),
                          leading: CircleAvatar(
                            backgroundColor: Colors.orange.shade50,
                            child: Text(
                              request.tableNumber.replaceAll('Bàn ', ''),
                              style: TextStyle(color: Colors.orange.shade800, fontWeight: FontWeight.bold),
                            ),
                          ),
                          title: Text(
                            'Bàn ${request.tableNumber}',
                            style: const TextStyle(fontWeight: FontWeight.black),
                          ),
                          subtitle: Text(
                            '${request.customerName} • ${DateFormat('HH:mm').format(request.createdAt.toLocal())}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              child: Column(
                                children: [
                                  const Divider(),
                                  ...request.items.map((item) => Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 4),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text('${item.quantity}x ${item.productName}', style: const TextStyle(fontWeight: FontWeight.w500)),
                                            Text('\$${(item.price * item.quantity).toStringAsFixed(2)}'),
                                          ],
                                        ),
                                      )),
                                  const Divider(),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Tổng cộng', style: TextStyle(fontWeight: FontWeight.black, fontSize: 16)),
                                      Text(
                                        '\$${request.totalAmount.toStringAsFixed(2)}',
                                        style: TextStyle(fontWeight: FontWeight.black, fontSize: 18, color: Colors.orange.shade800),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Expanded(child: _RejectButton(requestId: request.id)),
                                      const SizedBox(width: 12),
                                      Expanded(flex: 2, child: _ApproveButton(requestId: request.id)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}

class _RejectButton extends StatefulWidget {
  final String requestId;
  const _RejectButton({required this.requestId});

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
                    content: const Text('Bạn có chắc chắn muốn từ chối yêu cầu này không?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('HỦY')),
                      TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('TỪ CHỐI', style: TextStyle(color: Colors.red))),
                    ],
                  ),
                );

                if (confirm == true) {
                  setState(() => _isRejecting = true);
                  final success = await orderProvider.rejectRequest(widget.requestId);
                  if (success) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Đã từ chối đơn hàng')),
                    );
                  } else {
                    setState(() => _isRejecting = false);
                  }
                }
              },
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Colors.red),
          foregroundColor: Colors.red,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: _isRejecting
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.red, strokeWidth: 2))
            : const Text('TỪ CHỐI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ),
    );
  }
}

class _ApproveButton extends StatefulWidget {
  final String requestId;
  const _ApproveButton({required this.requestId});

  @override
  State<_ApproveButton> createState() => _ApproveButtonState();
}

class _ApproveButtonState extends State<_ApproveButton> {
  bool _isApproving = false;

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);

    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: _isApproving
            ? null
            : () async {
                setState(() => _isApproving = true);
                final success = await orderProvider.approveRequest(widget.requestId);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Đã duyệt đơn hàng thành công!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                } else {
                  setState(() => _isApproving = false);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Lỗi khi duyệt đơn hàng'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: _isApproving
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Text('DUYỆT ĐƠN', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }
}
