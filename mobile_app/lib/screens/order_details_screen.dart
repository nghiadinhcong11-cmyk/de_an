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
  final _voucherController = TextEditingController();
  String _paymentMethod = 'Cash'; // Mặc định tiền mặt
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Hero(
              tag: 'table-icon-${widget.order.tableNumber}', 
              child: Icon(Icons.chair_rounded, size: 20, color: Colors.orange.shade800),
            ),
            const SizedBox(width: 10),
            Hero(
              tag: 'table-number-${widget.order.tableNumber}',
              child: Material(
                color: Colors.transparent,
                child: Text(
                  'Bàn ${widget.order.tableNumber}', 
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)
                ),
              ),
            ),
          ],
        ),
        actions: [
            if (widget.order.status != 'Completed') TextButton.icon(
                onPressed: () {
                    // Logic mở POS để thêm món vào đơn này
                }, 
                icon: const Icon(Icons.add_circle_outline, size: 18), 
                label: const Text('THÊM MÓN', style: TextStyle(fontWeight: FontWeight.bold))
            )
        ],
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
            
            if (widget.order.status != 'Completed') ...[
              // Voucher Section
              const Text('MÃ GIẢM GIÁ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _voucherController,
                      decoration: InputDecoration(
                        hintText: 'Nhập mã voucher...',
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () {
                      // Trong thực tế sẽ gọi API check voucher trước
                      setState(() {}); 
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: const Text('ÁP DỤNG', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  )
                ],
              ),
              const SizedBox(height: 32),
            ],

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('TỔNG CỘNG', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
                Text('\$${widget.order.totalAmount.toStringAsFixed(2)}', 
                     style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 24, color: Colors.orange)),
              ],
            ),

            if (widget.order.status != 'Completed') ...[
              const SizedBox(height: 32),
              const Text('HÌNH THỨC THANH TOÁN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _paymentMethod = 'Cash'),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _paymentMethod == 'Cash' ? Colors.orange.shade50 : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _paymentMethod == 'Cash' ? Colors.orange : Colors.grey.shade200, width: 2),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.money, color: _paymentMethod == 'Cash' ? Colors.orange : Colors.grey),
                            const SizedBox(height: 8),
                            Text('TIỀN MẶT', style: TextStyle(fontWeight: FontWeight.bold, color: _paymentMethod == 'Cash' ? Colors.orange.shade900 : Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _paymentMethod = 'QR'),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _paymentMethod == 'QR' ? Colors.blue.shade50 : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _paymentMethod == 'QR' ? Colors.blue : Colors.grey.shade200, width: 2),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.qr_code, color: _paymentMethod == 'QR' ? Colors.blue : Colors.grey),
                            const SizedBox(height: 8),
                            Text('VIETQR', style: TextStyle(fontWeight: FontWeight.bold, color: _paymentMethod == 'QR' ? Colors.blue.shade900 : Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              
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
                    backgroundColor: _paymentMethod == 'QR' ? Colors.blue.shade700 : Colors.orange.shade600,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isProcessing 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(_paymentMethod == 'QR' ? 'LẤY MÃ VIETQR' : 'XÁC NHẬN TIỀN MẶT', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ] else ...[
              const SizedBox(height: 40),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.green.shade100),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 40),
                    SizedBox(height: 12),
                    Text('ĐƠN HÀNG ĐÃ HOÀN TẤT', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.green)),
                    Text('Thông tin đơn hàng đã được lưu vào lịch sử hệ thống', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.green)),
                  ],
                ),
              ),
            ],
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
      _paymentMethod,
      _voucherController.text.isNotEmpty ? _voucherController.text : null
    );

    if (result != null && mounted) {
      if (!context.mounted) return;
      
      if (_paymentMethod == 'QR') {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('Thanh toán VietQR', style: TextStyle(fontWeight: FontWeight.w900)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (result['qrUrl'] != null) 
                  Image.network(result['qrUrl'])
                else
                  const Text('Chưa cấu hình tài khoản nhận tiền'),
                const SizedBox(height: 10),
                if (result['discountAmount'] > 0)
                    Text('Giảm giá: -\$${result['discountAmount']}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                Text('Tổng thanh toán: \$${result['totalAmount']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  if (context.mounted) Navigator.pop(context); // Trở về màn hình bàn
                }, 
                child: const Text('HOÀN TẤT')
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thanh toán tiền mặt thành công!'), backgroundColor: Colors.green));
        Navigator.pop(context);
      }
    } else {
      if (mounted) setState(() => _isProcessing = false);
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lỗi thanh toán')));
    }
  }
}
