import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';
import 'user_info_screen.dart';
import '../utils/currency_util.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchShiftSummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final orderProvider = Provider.of<OrderProvider>(context);
    final user = authProvider.user;
    final summary = orderProvider.shiftSummary;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 60, 20, 40),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.orange.shade600, Colors.orange.shade800],
                ),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.white24,
                    child: Text(
                      user?['fullName']?.substring(0, 1) ?? 'U',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?['fullName'] ?? 'Người dùng',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                        Text(
                          user?['role'] ?? 'Nhân viên',
                          style: const TextStyle(fontSize: 14, color: Colors.white70, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Shift Summary Section
            if (summary != null) Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                elevation: 0,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('THỐNG KÊ HÔM NAY', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.grey, letterSpacing: 1)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                            child: Text('Đang làm việc', style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.bold, fontSize: 10)),
                          )
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          _SummaryItem(label: 'Doanh thu', value: CurrencyUtil.format((summary['totalRevenue'] ?? 0).toDouble()), color: Colors.orange.shade800),
                          const SizedBox(width: 20),
                          _SummaryItem(label: 'Đơn hàng', value: '${summary['totalOrders']}', color: Colors.black),
                        ],
                      ),
                      const Divider(height: 32),
                      Row(
                        children: [
                          _SummaryDetail(label: 'Tiền mặt', value: CurrencyUtil.format((summary['cashRevenue'] ?? 0).toDouble()), icon: Icons.money),
                          const VerticalDivider(),
                          _SummaryDetail(label: 'VietQR', value: CurrencyUtil.format((summary['qrRevenue'] ?? 0).toDouble()), icon: Icons.qr_code),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Profile Options
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _ProfileItem(
                    icon: Icons.person_outline,
                    title: 'Thông tin cá nhân',
                    subtitle: '@${user?['username']}',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const UserInfoScreen()),
                      );
                    },
                  ),
                  _ProfileItem(
                    icon: Icons.history,
                    title: 'Lịch sử ca làm',
                    onTap: () {},
                  ),
                  const SizedBox(height: 20),
                  const Divider(),
                  const SizedBox(height: 20),
                  _ProfileItem(
                    icon: Icons.logout,
                    title: 'Đăng xuất',
                    titleColor: Colors.red,
                    iconColor: Colors.red,
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Đăng xuất?', style: TextStyle(fontWeight: FontWeight.w900)),
                          content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('HỦY')),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(ctx);
                                authProvider.logout();
                              }, 
                              child: const Text('ĐĂNG XUẤT', style: TextStyle(color: Colors.red))
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _SummaryItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}

class _SummaryDetail extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _SummaryDetail({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
              Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProfileItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Color? titleColor;
  final Color? iconColor;

  const _ProfileItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
    this.titleColor,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
      color: Colors.white,
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: iconColor ?? Colors.orange.shade600),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: titleColor)),
        subtitle: subtitle != null ? Text(subtitle!) : null,
        trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.grey),
      ),
    );
  }
}
