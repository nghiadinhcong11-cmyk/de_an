import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/order.dart';
import '../providers/order_provider.dart';

class OrderDetailsScreen extends StatefulWidget {
  final OrderModel order;
  const OrderDetailsScreen({super.key, required this.order});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Chi tiết đơn ${widget.order.tableNumber}', style: const TextStyle(fontWeight: FontWeight.black)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('DANH SÁCH MÓN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 10),
            ...widget.order.items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${item.quantity}x ${item.productName}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text('\$${(item.unitPrice * item.quantity).toStringAsFixed(2)}'),
                ],
              ),
            )),
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('TỔNG CỘNG', style: TextStyle(fontWeight: FontWeight.black, fontSize: 20)),
                Text('\$${widget.order.totalAmount.toStringAsFixed(2)}', 
                     style: const TextStyle(fontWeight: FontWeight.black, fontSize: 24, color: Colors.orange)),
              ],
            ),
            const SizedBox(height: 40),
            
            const Text('TÍCH ĐIỂM KHÁCH HÀNG (TÙY CHỌN)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 10),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                hintText: 'Số điện thoại',
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                hintText: 'Tên khách hàng (nếu là khách mới)',
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _handlePayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange.shade600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isProcessing 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('XÁC NHẬN THANH TOÁN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handlePayment() async {
    setState(() => _isProcessing = true);
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);
    
    final result = await orderProvider.processPayment(
      widget.order.id, 
      _phoneController.text.isNotEmpty ? _phoneController.text : null,
      _nameController.text.isNotEmpty ? _nameController.text : null,
    );

    if (result != null && mounted) {
      // Show VietQR
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: const Text('Thanh toán VietQR', style: TextStyle(fontWeight: FontWeight.black)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (result['qrUrl'] != null) 
                Image.network(result['qrUrl'])
              else
                const Text('Chưa cấu hình tài khoản nhận tiền'),
              const SizedBox(height: 10),
              Text('Số tiền: \$${result['totalAmount']}', style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context); // Trở về màn hình bàn
              }, 
              child: const Text('HOÀN TẤT')
            ),
          ],
        ),
      );
    } else {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lỗi thanh toán')));
    }
  }
}
