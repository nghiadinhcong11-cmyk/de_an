import 'package:intl/intl.dart';

class CurrencyUtil {
  static String format(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: 'đ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }
}
