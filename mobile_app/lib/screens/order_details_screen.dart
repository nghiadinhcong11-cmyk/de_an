import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/order.dart';
import '../providers/order_provider.dart';
import '../utils/currency_util.dart';

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
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchProducts();
    });
  }

  void _showAddItemDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AddItemSheet(orderId: widget.order.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Hero(
              tag: 'table-icon-${widget.order.tableNumber}',
              child: Icon(
                Icons.chair_rounded,
                size: 20,
                color: Colors.orange.shade800,
              ),
            ),
            const SizedBox(width: 10),
            Hero(
              tag: 'table-number-${widget.order.tableNumber}',
              child: Material(
                color: Colors.transparent,
                child: Text(
                  'Bàn ${widget.order.tableNumber}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          if (widget.order.status != 'Completed')
            TextButton.icon(
              onPressed: _showAddItemDialog,
              icon: const Icon(Icons.add_circle_outline, size: 18),
              label: const Text(
                'THÊM MÓN',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'DANH SÁCH MÓN',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 10),
            ...widget.order.items.map(
              (item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${item.quantity}x ${item.productName}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(CurrencyUtil.format(item.unitPrice * item.quantity)),
                  ],
                ),
              ),
            ),
            const Divider(height: 32),

            if (widget.order.status != 'Completed') ...[
              // Voucher Section
              const Text(
                'MÃ GIẢM GIÁ',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
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
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () {
                      // Trong thực tế sẽ gọi API check voucher trước
                      setState(() {});
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'ÁP DỤNG',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'TỔNG CỘNG',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
                ),
                Text(
                  CurrencyUtil.format(widget.order.totalAmount),
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 24,
                    color: Colors.orange,
                  ),
                ),
              ],
            ),

            if (widget.order.status != 'Completed') ...[
              const SizedBox(height: 32),
              const Text(
                'HÌNH THỨC THANH TOÁN',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _paymentMethod = 'Cash'),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _paymentMethod == 'Cash'
                              ? Colors.orange.shade50
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _paymentMethod == 'Cash'
                                ? Colors.orange
                                : Colors.grey.shade200,
                            width: 2,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.money,
                              color: _paymentMethod == 'Cash'
                                  ? Colors.orange
                                  : Colors.grey,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'TIỀN MẶT',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _paymentMethod == 'Cash'
                                    ? Colors.orange.shade900
                                    : Colors.grey,
                              ),
                            ),
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
                          color: _paymentMethod == 'QR'
                              ? Colors.blue.shade50
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _paymentMethod == 'QR'
                                ? Colors.blue
                                : Colors.grey.shade200,
                            width: 2,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.qr_code,
                              color: _paymentMethod == 'QR'
                                  ? Colors.blue
                                  : Colors.grey,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'VIETQR',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _paymentMethod == 'QR'
                                    ? Colors.blue.shade900
                                    : Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              const Text(
                'TÍCH ĐIỂM KHÁCH HÀNG (TÙY CHỌN)',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'Số điện thoại',
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: 'Tên khách hàng (nếu là khách mới)',
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _handlePayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _paymentMethod == 'QR'
                        ? Colors.blue.shade700
                        : Colors.orange.shade600,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isProcessing
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          _paymentMethod == 'QR'
                              ? 'LẤY MÃ VIETQR'
                              : 'XÁC NHẬN TIỀN MẶT',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
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
                    Text(
                      'ĐƠN HÀNG ĐÃ HOÀN TẤT',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        color: Colors.green,
                      ),
                    ),
                    Text(
                      'Thông tin đơn hàng đã được lưu vào lịch sử hệ thống',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Colors.green),
                    ),
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
      _voucherController.text.isNotEmpty ? _voucherController.text : null,
    );

    if (!mounted) return;

    if (result != null) {
      if (_paymentMethod == 'QR') {
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) {
            return AlertDialog(
              title: const Text(
                'Thanh toán VietQR',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (result['qrUrl'] != null)
                      Image.network(result['qrUrl'])
                    else
                      const Text('Chưa cấu hình tài khoản nhận tiền'),
                    const SizedBox(height: 10),
                    if ((result['discountAmount'] ?? 0) > 0)
                      Text(
                        'Giảm giá: -${CurrencyUtil.format((result['discountAmount'] ?? 0).toDouble())}',
                        style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    Text(
                      'Tổng thanh toán: ${CurrencyUtil.format((result['totalAmount'] ?? 0).toDouble())}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    if (mounted) Navigator.pop(context);
                  },
                  child: const Text('HOÀN TẤT'),
                ),
              ],
            );
          },
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Thanh toán tiền mặt thành công!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } else {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Lỗi thanh toán')));
    }
  }
}

class _AddItemSheet extends StatefulWidget {
  final String orderId;
  const _AddItemSheet({required this.orderId});

  @override
  State<_AddItemSheet> createState() => _AddItemSheetState();
}

class _AddItemSheetState extends State<_AddItemSheet> {
  final Map<String, int> _selectedItems = {};
  final Map<String, String> _notes = {}; // ProductId -> Note
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final products = orderProvider.products;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Thêm món vào đơn',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final p = products[index];
                final qty = _selectedItems[p.id] ?? 0;
                final hasNote = _notes[p.id]?.isNotEmpty ?? false;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: Colors.orange.shade50,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.fastfood,
                              color: Colors.orange,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  CurrencyUtil.format(p.price),
                                  style: TextStyle(
                                    color: Colors.orange.shade800,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              if (qty > 0)
                                IconButton(
                                  icon: const Icon(
                                    Icons.remove_circle_outline,
                                    size: 20,
                                  ),
                                  onPressed: () => setState(() {
                                    _selectedItems[p.id] = qty - 1;
                                    if (qty - 1 == 0) _notes.remove(p.id);
                                  }),
                                ),
                              if (qty > 0)
                                Text(
                                  qty.toString(),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              IconButton(
                                icon: const Icon(
                                  Icons.add_circle_outline,
                                  size: 20,
                                  color: Colors.orange,
                                ),
                                onPressed: () => setState(
                                  () => _selectedItems[p.id] = qty + 1,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      if (qty > 0)
                        Padding(
                          padding: const EdgeInsets.only(top: 8, left: 66),
                          child: TextField(
                            onChanged: (val) => _notes[p.id] = val,
                            style: const TextStyle(fontSize: 12),
                            decoration: InputDecoration(
                              hintText: 'Ghi chú (Vd: ít cay, không hành...)',
                              prefixIcon: Icon(
                                Icons.edit_note,
                                size: 18,
                                color: hasNote ? Colors.orange : Colors.grey,
                              ),
                              filled: true,
                              fillColor: Colors.grey.shade50,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ),
          if (_selectedItems.values.any((v) => v > 0))
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(20),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: _isSaving
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'XÁC NHẬN THÊM',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _handleSave() async {
    setState(() => _isSaving = true);
    final provider = Provider.of<OrderProvider>(context, listen: false);
    final items = _selectedItems.entries
        .where((e) => e.value > 0)
        .map(
          (e) => {
            'productId': e.key,
            'quantity': e.value,
            'note': _notes[e.key] ?? '',
          },
        )
        .toList();

    final success = await provider.addItemsToOrder(widget.orderId, items);
    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã thêm món thành công!'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lỗi khi thêm món'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
