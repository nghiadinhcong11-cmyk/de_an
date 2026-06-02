import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { ShoppingCart, Plus, Minus, ChevronRight, Utensils } from "lucide-react";
import { mockTables, mockMenuItems, mockRestaurant, type MenuItem } from "../data/mockData";

type CartItem = MenuItem & { qty: number };

const categoryLabel: Record<string, string> = {
  food: "Món ăn",
  drinks: "Đồ uống",
  desserts: "Tráng miệng",
  combo: "Combo",
};

const categoryEmoji: Record<string, string> = {
  food: "🍽️",
  drinks: "🥤",
  desserts: "🍰",
  combo: "🎁",
};

export function TableOrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const table = mockTables.find((t) => t.id === tableId);

  const [activeCategory, setActiveCategory] = useState<string>("food");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categories = Array.from(new Set(mockMenuItems.map((m) => m.category)));
  const filtered = mockMenuItems.filter(
    (m) => m.category === activeCategory && m.status === "available"
  );

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  const getQty = (id: string) => cart.find((i) => i.id === id)?.qty ?? 0;

  const handleOrder = () => {
    setOrderPlaced(true);
    setCart([]);
  };

  if (!table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="text-5xl">❓</div>
        <h2 className="text-xl font-bold">Không tìm thấy bàn</h2>
        <p className="text-gray-500">QR code không hợp lệ hoặc bàn không tồn tại.</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="text-6xl">✅</div>
        <h2 className="text-xl font-bold text-green-800">Gọi món thành công!</h2>
        <p className="text-gray-600">Nhân viên sẽ mang món đến bàn {table.number} của bạn.</p>
        <Button onClick={() => setOrderPlaced(false)} variant="outline" className="mt-4 border-green-200">
          Gọi thêm món
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-orange-600 text-white px-4 pt-8 pb-6 sticky top-0 z-10 shadow">
        <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
          <Utensils className="w-4 h-4" />
          <span>{mockRestaurant.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Bàn {table.number}</h1>
            <p className="text-white/70 text-sm">{table.capacity} chỗ ngồi • Gọi món tại bàn</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-sm px-3">
            #{tableId}
          </Badge>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-white text-orange-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {categoryEmoji[cat]} {categoryLabel[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="flex-1 p-4 space-y-3 pb-32">
        <h2 className="text-sm text-gray-500 mb-3">
          {categoryEmoji[activeCategory]} {categoryLabel[activeCategory]}
        </h2>
        {filtered.map((item) => {
          const qty = getQty(item.id);
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {categoryEmoji[item.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                    <div className="text-orange-600 font-bold mt-1">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 ? (
                      <>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-5 text-center font-semibold">{qty}</span>
                      </>
                    ) : null}
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center hover:bg-orange-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t shadow-lg">
          {/* Cart items summary */}
          <div className="mb-3 space-y-1 max-h-32 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.qty}</span>
                <span className="text-gray-600">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleOrder} className="w-full h-12 gap-3 text-base bg-orange-600 hover:bg-orange-700">
            <ShoppingCart className="w-5 h-5" />
            <span>Gọi món</span>
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-sm">{cartCount}</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
            <span>${cartTotal.toFixed(2)}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
