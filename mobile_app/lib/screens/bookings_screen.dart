import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import '../providers/auth_provider.dart';
import '../api/api_service.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchBookings();
  }

  Future<void> _fetchBookings() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final response = await api.dio.get('/bookings/owner');
      if (response.statusCode == 200) {
        setState(() => _bookings = response.data);
      }
    } catch (e) {
      debugPrint('Error fetching bookings: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: RefreshIndicator(
        onRefresh: _fetchBookings,
        child: _isLoading && _bookings.isEmpty
            ? const Center(child: CircularProgressIndicator(color: Color(0xFFEA580C)))
            : _bookings.isEmpty
                ? const Center(child: Text('Không có lịch đặt bàn nào'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _bookings.length,
                    itemBuilder: (context, index) {
                      final booking = _bookings[index];
                      return _BookingCard(
                        booking: booking,
                        onRefresh: _fetchBookings,
                      );
                    },
                  ),
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final dynamic booking;
  final VoidCallback onRefresh;

  const _BookingCard({required this.booking, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final bool isPending = booking['status'] == 'Pending';
    final String tableLabel = booking['tableId'] != null 
        ? 'Bàn ${booking['tableNumber'] ?? '??'} - ${booking['zoneName'] ?? 'Chung'}'
        : 'Bàn tự do';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFFEA580C)),
                    const SizedBox(width: 8),
                    Text(
                      _formatTime(booking['bookingDate']),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(booking['status']).withAlpha(40),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    booking['status'].toString().toUpperCase(),
                    style: TextStyle(color: _getStatusColor(booking['status']), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tableLabel,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF111827)),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined, size: 12, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(
                                booking['branchName'] ?? 'Chi nhánh',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('MÃ XÁC NHẬN', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.grey)),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF7ED),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFFEDD5)),
                          ),
                          child: Text(
                            booking['id'].toString().substring(0, 8).toUpperCase(),
                            style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.w900, fontSize: 12, fontFeatures: [FontFeature.tabularFigures()]),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                
                const SizedBox(height: 20),
                
                // Customer Info
                Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: const Color(0xFFFFF7ED),
                      backgroundImage: booking['customerAvatar'] != null ? NetworkImage(booking['customerAvatar']) : null,
                      child: booking['customerAvatar'] == null 
                        ? Text(booking['customerName']?.substring(0, 1) ?? 'K', style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.w900, fontSize: 14)) 
                        : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(booking['customerName'] ?? 'Khách vãng lai', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                          Text(booking['customerPhone'] ?? 'Chưa có SĐT', style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
                
                // Details Grid
                Row(
                  children: [
                    Expanded(child: _InfoTile(label: 'SỐ KHÁCH', value: '${booking['numberOfGuests']} người', icon: Icons.people_outline_rounded)),
                    const SizedBox(width: 12),
                    Expanded(child: _InfoTile(label: 'LOẠI KHÁCH', value: booking['customerId'] != null ? 'Thành viên' : 'Vãng lai', icon: Icons.person_outline_rounded)),
                  ],
                ),

                if (booking['notes'] != null && booking['notes'].toString().isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('GHI CHÚ CỦA KHÁCH', style: TextStyle(color: Color(0xFFEA580C), fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                        const SizedBox(height: 8),
                        Text(
                          '\"${booking['notes']}\"',
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500, fontStyle: FontStyle.italic, height: 1.5),
                        ),
                      ],
                    ),
                  ),
                ],

                if (isPending) ...[
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _handleAction(context, booking['id'], 'confirm'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF111827),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                          label: const Text('CHẤP NHẬN', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: IconButton(
                          onPressed: () => _handleAction(context, booking['id'], 'reject'),
                          icon: const Icon(Icons.close_rounded, color: Colors.red),
                          padding: const EdgeInsets.all(12),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(String dateStr) {
    try {
      final date = DateTime.parse(dateStr).toLocal();
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} - ${date.day}/${date.month}';
    } catch (e) {
      return '??:??';
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Pending': return Colors.orange;
      case 'Confirmed': return Colors.green;
      case 'Rejected': return Colors.red;
      case 'Cancelled': return Colors.grey;
      case 'Completed': return Colors.blue;
      default: return Colors.grey;
    }
  }

  Future<void> _handleAction(BuildContext context, String id, String action) async {
    if (action == 'reject') {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Từ chối?'),
          content: const Text('Bạn có chắc muốn từ chối lịch đặt này?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('HỦY')),
            TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('TỪ CHỐI', style: TextStyle(color: Colors.red))),
          ],
        ),
      );
      if (confirm != true) return;
    }

    try {
      final api = ApiService();
      await api.dio.post('/bookings/$id/$action');
      onRefresh();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lỗi xử lý yêu cầu')));
      }
    }
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _InfoTile({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 10, color: Colors.grey),
              const SizedBox(width: 4),
              Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
        ],
      ),
    );
  }
}
