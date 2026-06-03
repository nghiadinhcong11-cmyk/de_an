import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'order_requests_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 2; // Default to requests for employee

  final List<Widget> _screens = [
    const Center(child: Text('Danh sách đơn hàng')),
    const Center(child: Text('POS - Đặt món')),
    const OrderRequestsScreen(),
    const Center(child: Text('Cá nhân')),
  ];

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Restaurant POS', style: TextStyle(fontWeight: FontWeight.black, fontSize: 18)),
            Text(
              '${user?['fullName'] ?? 'Nhân viên'} - ${user?['role'] ?? ''}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authProvider.logout(),
          ),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          type: BottomNavigationBarType.fixed,
          selectedItemColor: Colors.orange.shade600,
          unselectedItemColor: Colors.grey,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Đơn hàng'),
            BottomNavigationBarItem(icon: Icon(Icons.add_shopping_cart), label: 'POS'),
            BottomNavigationBarItem(icon: Icon(Icons.notifications_none), label: 'Yêu cầu'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Cá nhân'),
          ],
        ),
      ),
    );
  }
}
