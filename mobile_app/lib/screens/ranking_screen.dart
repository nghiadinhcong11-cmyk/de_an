import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_service.dart';
import '../providers/auth_provider.dart';

class RankingScreen extends StatefulWidget {
  const RankingScreen({super.key});

  @override
  State<RankingScreen> createState() => _RankingScreenState();
}

class _RankingScreenState extends State<RankingScreen> {
  List<dynamic> _performance = [];
  bool _isLoading = true;
  int _selectedMonth = DateTime.now().month;
  int _selectedYear = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    _fetchPerformance();
  }

  Future<void> _fetchPerformance() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final response = await api.dio.get(
        '/reports/staff-performance',
        queryParameters: {
          'month': _selectedMonth,
          'year': _selectedYear,
        },
      );
      setState(() {
        _performance = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể tải dữ liệu xếp hạng')),
        );
      }
    }
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final month = await showDialog<int>(
          context: context,
          builder: (context) => SimpleDialog(
            title: const Text('Chọn tháng vinh danh'),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            children: [
              SizedBox(
                width: double.maxFinite,
                child: GridView.count(
                  shrinkWrap: true,
                  crossAxisCount: 3,
                  padding: const EdgeInsets.all(16),
                  children: List.generate(12, (i) => i + 1).map((m) => InkWell(
                    onTap: () => Navigator.pop(context, m),
                    child: Container(
                      margin: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: m == _selectedMonth ? const Color(0xFFEA580C) : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          'T$m',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: m == _selectedMonth ? Colors.white : Colors.black,
                          ),
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              ),
            ],
          ),
        );
        if (month != null && month != _selectedMonth) {
          setState(() {
            _selectedMonth = month;
          });
          _fetchPerformance();
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_month, size: 16, color: Color(0xFFEA580C)),
            const SizedBox(width: 4),
            Text(
              'T$_selectedMonth/$_selectedYear',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final currentUserId = auth.user?['id'];

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFEA580C)))
          : RefreshIndicator(
              onRefresh: _fetchPerformance,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.between,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'VINH DANH',
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: -1,
                                    ),
                                  ),
                                  Text(
                                    'Xếp hạng nhân viên tháng $_selectedMonth/$_selectedYear',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              _buildDatePicker(),
                            ],
                          ),
                          const SizedBox(height: 24),
                          if (_performance.isNotEmpty) _buildTopThree(currentUserId),
                        ],
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          if (index < 3) return const SizedBox.shrink();
                          final staff = _performance[index];
                          return _buildRankingItem(staff, index + 1, currentUserId);
                        },
                        childCount: _performance.length,
                      ),
                    ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
            ),
    );
  }

  Widget _buildTopThree(String? currentUserId) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        if (_performance.length > 1) _buildTopSpotlight(_performance[1], 2, 140, currentUserId),
        if (_performance.isNotEmpty) _buildTopSpotlight(_performance[0], 1, 180, currentUserId),
        if (_performance.length > 2) _buildTopSpotlight(_performance[2], 3, 130, currentUserId),
      ],
    );
  }

  Widget _buildTopSpotlight(dynamic staff, int rank, double height, String? currentUserId) {
    final bool isMe = staff['staffId'] == currentUserId;
    final bool isFirst = rank == 1;

    return Column(
      children: [
        if (isFirst)
          const Icon(Icons.workspace_premium_rounded, color: Color(0xFFFFD700), size: 32),
        const SizedBox(height: 8),
        Container(
          width: 100,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isFirst ? const Color(0xFFEA580C) : Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: isFirst ? const Color(0xFFEA580C).withOpacity(0.3) : Colors.black.withOpacity(0.05),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            children: [
              CircleAvatar(
                radius: isFirst ? 30 : 25,
                backgroundColor: isFirst ? Colors.white.withOpacity(0.2) : Colors.grey[100],
                child: Text(
                  staff['staffName'][0],
                  style: TextStyle(
                    fontSize: isFirst ? 24 : 20,
                    fontWeight: FontWeight.w900,
                    color: isFirst ? Colors.white : Colors.black,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                staff['staffName'].split(' ').last,
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 13,
                  color: isFirst ? Colors.white : Colors.black,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                '${staff['averageRating'].toStringAsFixed(1)} ⭐',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                  color: isFirst ? Colors.white70 : Colors.grey[500],
                ),
              ),
              if (isMe)
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(isFirst ? 0.3 : 1),
                    borderRadius: BorderRadius.circular(4),
                    border: isFirst ? null : Border.all(color: const Color(0xFFEA580C)),
                  ),
                  child: const Text(
                    'BẠN',
                    style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFFEA580C)),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRankingItem(dynamic staff, int rank, String? currentUserId) {
    final bool isMe = staff['staffId'] == currentUserId;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isMe ? const Color(0xFFFFF7ED) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isMe ? const Color(0xFFFED7AA) : Colors.transparent,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                rank.toString(),
                style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.grey),
              ),
            ),
          ),
          const SizedBox(width: 16),
          CircleAvatar(
            backgroundColor: Colors.grey[200],
            child: Text(
              staff['staffName'][0],
              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  staff['staffName'],
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
                Text(
                  '${staff['feedbackCount']} lượt phục vụ',
                  style: TextStyle(fontSize: 11, color: Colors.grey[500], fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  const Icon(Icons.star_rounded, color: Colors.orange, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    staff['averageRating'].toStringAsFixed(1),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                ],
              ),
              if (isMe)
                const Text(
                  'BẠN',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFEA580C),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
