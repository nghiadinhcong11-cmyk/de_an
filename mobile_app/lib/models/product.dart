class Product {
  final String id;
  final String name;
  final double price;
  final String? imageUrl;
  final String categoryId;

  Product({
    required this.id,
    required this.name,
    required this.price,
    this.imageUrl,
    required this.categoryId,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      price: (json['price'] ?? 0).toDouble(),
      imageUrl: json['imageUrl'],
      categoryId: json['categoryId'],
    );
  }
}
