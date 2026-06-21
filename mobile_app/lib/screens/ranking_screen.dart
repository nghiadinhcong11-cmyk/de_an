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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                          const SizedBox(height: 32),
                          const Text(
                            'DANH SÁCH XẾP HẠNG',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Colors.grey,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 16),
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
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (_performance.length > 1) 
            _buildPodiumItem(_performance[1], 2, Colors.grey[400]!, 140, currentUserId),
          const SizedBox(width: 8),
          if (_performance.isNotEmpty) 
            _buildPodiumItem(_performance[0], 1, const Color(0xFFFFD700), 180, currentUserId),
          const SizedBox(width: 8),
          if (_performance.length > 2) 
            _buildPodiumItem(_performance[2], 3, const Color(0xFFCD7F32), 130, currentUserId),
        ],
      ),
    );
  }

  Widget _buildPodiumItem(dynamic staff, int rank, Color color, double height, String? currentUserId) {
    final bool isMe = staff['staffId'] == currentUserId;
    final bool isFirst = rank == 1;

    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          // Avatar & Crown/Medal
          Stack(
            alignment: Alignment.center,
            clipBehavior: Clip.none,
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.3),
                      blurRadius: 15,
                      spreadRadius: 2,
                    )
                  ],
                ],
                child: CircleAvatar(
                  radius: isFirst ? 35 : 28,
                  backgroundColor: Colors.white,
                  child: Text(
                    staff['staffName'][0],
                    style: TextStyle(
                      fontSize: isFirst ? 28 : 22,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: -15,
                child: isFirst 
                  ? const Icon(Icons.workspace_premium_rounded, color: Color(0xFFFFD700), size: 30)
                  : Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        rank.toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Name
          Text(
            staff['staffName'].split(' ').last,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          // Rating & Score
          Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star_rounded, color: Colors.orange, size: 12),
                  Text(
                    ' ${staff['averageRating'].toStringAsFixed(1)}',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 11,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              Text(
                '${staff['performanceScore'].toStringAsFixed(0)} điểm',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 10,
                  color: Color(0xFFEA580C),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Podium Base
          Container(
            height: height - 100,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: isFirst 
                  ? [const Color(0xFFEA580C), const Color(0xFF9A3412)]
                  : [Colors.grey[200]!, Colors.grey[300]!],
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                )
              ],
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isFirst ? 'VÀNG' : rank == 2 ? 'BẠC' : 'ĐỒNG',
                    style: TextStyle(
                      color: isFirst ? Colors.white : Colors.grey[600],
                      fontSize: 10,
                      fontWeight: FontWeight.black,
                      letterSpacing: 1,
                    ),
                  ),
                  if (isMe)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'BẠN',
                        style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFEA580C).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${staff['performanceScore'].toStringAsFixed(1)} pts',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                    color: Color(0xFFEA580C),
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.star_rounded, color: Colors.orange, size: 14),
                  const SizedBox(width: 2),
                  Text(
                    staff['averageRating'].toStringAsFixed(1),
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
