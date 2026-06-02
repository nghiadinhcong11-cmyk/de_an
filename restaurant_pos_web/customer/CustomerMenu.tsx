import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Search, Plus, Star } from "lucide-react";
import { mockMenuItems, type MenuItem } from "../data/mockData";
import { useNavigate } from "react-router-dom";

export function CustomerMenu() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([]);

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "food", label: "Món ăn" },
    { value: "drinks", label: "Đồ uống" },
    { value: "desserts", label: "Tráng miệng" },
    { value: "combo", label: "Combo" },
  ];

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.item.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    setSelectedItem(null);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200 shadow-sm">
        <div className="p-4">
          <h2 className="text-xl font-bold">Thực đơn</h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm món ăn..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10 border-orange-100 focus:ring-orange-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4">
        {/* Popular Section */}
        {selectedCategory === "all" && !searchTerm && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <h3 className="font-bold">Món bán chạy</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.slice(0, 4).map((item) => (
                <Card key={item.id} className="cursor-pointer border-none shadow-md hover:scale-[1.02] transition-transform" onClick={() => setSelectedItem(item)}>
                  <CardContent className="p-3">
                    <div className="text-4xl mb-2 text-center">🍽️</div>
                    <h4 className="text-sm font-bold mb-1 truncate">{item.name}</h4>
                    <div className="text-orange-600 font-bold">${item.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Items */}
        <div>
          <h3 className="mb-3 font-bold text-lg">
            {selectedCategory === "all" ? "Tất cả món ăn" : categories.find((c) => c.value === selectedCategory)?.label}
          </h3>
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="cursor-pointer border-none shadow-sm hover:shadow-md transition-shadow" onClick={() => setSelectedItem(item)}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="text-4xl w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center">🍽️</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <Badge variant="outline" className="ml-2 border-orange-200 text-orange-700">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-orange-600 font-bold text-lg">${item.price.toFixed(2)}</div>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 rounded-full h-8 w-8 p-0"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 max-w-md mx-auto z-20">
          <Button
            className="w-full shadow-2xl bg-orange-600 hover:bg-orange-700 h-12 text-base font-bold flex justify-between px-6"
            size="lg"
            onClick={() => navigate("/customer/cart")}
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                 {cartItemCount}
              </span>
              Xem giỏ hàng
            </div>
            <span>
              ${cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0).toFixed(2)}
            </span>
          </Button>
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="rounded-t-2xl sm:rounded-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-bold text-xl">{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  <Badge variant="outline" className="border-orange-200 text-orange-700">{selectedItem.category}</Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="text-8xl text-center mb-6 py-8 bg-orange-50 rounded-2xl">🍽️</div>
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedItem.description}</p>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-orange-600">
                    ${selectedItem.price.toFixed(2)}
                  </span>
                  <Badge className={selectedItem.status === "available" ? "bg-green-500" : "bg-red-500"}>
                    {selectedItem.status === "available" ? "Còn món" : "Hết món"}
                  </Badge>
                </div>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold"
                  size="lg"
                  onClick={() => addToCart(selectedItem)}
                  disabled={selectedItem.status !== "available"}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
