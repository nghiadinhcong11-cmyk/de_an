import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';

class POSScreen extends StatefulWidget {
  const POSScreen({super.key});

  @override
  State<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends State<POSScreen> {
  String? _selectedTableId;
  final Map<String, int> _cart = {}; // ProductId -> Quantity

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<OrderProvider>(context, listen: false);
      provider.fetchTables();
      provider.fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final availableTables = orderProvider.tables.where((t) => t.status == 'Available').toList();

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Table Selection Header
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('VỊ TRÍ BÀN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedTableId,
                  icon: const Icon(Icons.keyboard_arrow_down_rounded),
                  decoration: InputDecoration(
                    hintText: 'Chọn bàn đang trống...',
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade100)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade100)),
                  ),
                  items: availableTables.map((t) => DropdownMenuItem(
                    value: t.id,
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(4)),
                          child: Text(t.branchName ?? 'CH', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.orange.shade900)),
                        ),
                        const SizedBox(width: 8),
                        Text('${t.zoneName ?? 'Chung'} - ${t.tableNumber}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  )).toList(),
                  onChanged: (val) => setState(() => _selectedTableId = val),
                ),
              ],
            ),
          ),
          
          // Product Grid
          Expanded(
            child: orderProvider.isLoading 
                ? const Center(child: CircularProgressIndicator())
                : GridView.builder(
                    padding: const EdgeInsets.all(20),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: orderProvider.products.length,
                    itemBuilder: (context, index) {
                      final product = orderProvider.products[index];
                      final qty = _cart[product.id] ?? 0;
                      final bool isSelected = qty > 0;

                      return AnimatedScale(
                        scale: isSelected ? 1.02 : 1.0,
                        duration: const Duration(milliseconds: 200),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(28),
                            border: Border.all(color: isSelected ? const Color(0xFFEA580C).withAlpha(100) : Colors.grey.shade100, width: isSelected ? 2 : 1),
                            boxShadow: [
                              isSelected 
                                ? BoxShadow(color: const Color(0xFFEA580C).withAlpha(30), blurRadius: 20, offset: const Offset(0, 10))
                                : BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 15, offset: const Offset(0, 8)),
                            ],
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Container(
                                  width: double.infinity,
                                  color: isSelected ? const Color(0xFFFFF7ED) : const Color(0xFFF9FAFB),
                                  child: Icon(
                                    Icons.fastfood_rounded, 
                                    size: 48, 
                                    color: isSelected ? const Color(0xFFF97316) : Colors.grey.shade300
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(product.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 4),
                                    Text('${product.price.toStringAsFixed(0)}đ', style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.w900, fontSize: 16)),
                                    const SizedBox(height: 12),
                                    
                                    if (qty == 0) 
                                      SizedBox(
                                        width: double.infinity,
                                        child: ElevatedButton(
                                          onPressed: () => setState(() => _cart[product.id] = 1),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.black,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
                                          child: const Text('THÊM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                                        ),
                                      )
                                    else
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          _QtyBtn(icon: Icons.remove, onTap: () => setState(() => _cart[product.id] = qty - 1)),
                                          TweenAnimationBuilder<int>(
                                            tween: IntTween(begin: qty, end: qty),
                                            duration: const Duration(milliseconds: 200),
                                            builder: (context, value, child) => Text(
                                              value.toString(), 
                                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)
                                            ),
                                          ),
                                          _QtyBtn(icon: Icons.add, isPlus: true, onTap: () => setState(() => _cart[product.id] = qty + 1)),
                                        ],
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          
          // Checkout Bar
          AnimatedSize(
            duration: const Duration(milliseconds: 400),
            curve: Curves.elasticOut,
            child: _cart.values.any((q) => q > 0) ? Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(40), topRight: Radius.circular(40)),
                boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 40, offset: const Offset(0, -10))],
              ),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 64,
                  child: ElevatedButton(
                    onPressed: _selectedTableId == null ? null : _handleCreateOrder,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEA580C),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.shopping_basket_rounded, size: 20),
                        const SizedBox(width: 12),
                        const Text('XÁC NHẬN ĐẶT MÓN', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5)),
                      ],
                    ),
                  ),
                ),
              ),
            ) : const SizedBox(width: double.infinity, height: 0),
          ),
        ],
      ),
    );
  }

  void _handleCreateOrder() async {
    final provider = Provider.of<OrderProvider>(context, listen: false);
    final items = _cart.entries
        .where((e) => e.value > 0)
        .map((e) => {'productId': e.key, 'quantity': e.value})
        .toList();

    final success = await provider.createManualOrder(_selectedTableId!, items);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Đã tạo đơn hàng thành công!', style: TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.green.shade700,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        )
      );
      setState(() {
        _cart.clear();
        _selectedTableId = null;
      });
    } else {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lỗi khi tạo đơn hàng'), backgroundColor: Colors.red));
    }
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool isPlus;
  const _QtyBtn({required this.icon, required this.onTap, this.isPlus = false});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: isPlus ? const Color(0xFFEA580C) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 16, color: isPlus ? Colors.white : Colors.black),
      ),
    );
  }
}
