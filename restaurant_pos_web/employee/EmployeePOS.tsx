import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Plus, Minus, Trash2, Search, QrCode, CreditCard, Banknote, Printer } from "lucide-react";
import { mockMenuItems, mockTables, type MenuItem } from "../data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function EmployeePOS() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // XÓA THUẾ: Tổng bằng tạm tính

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.menuItemId === item.id);
    if (existingItem) {
      setCart(cart.map((cartItem) => cartItem.menuItemId === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
    } else {
      setCart([...cart, { id: Date.now().toString(), menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Bán hàng (POS)</h2>
          <div className="flex items-center gap-4">
              <Label className="font-bold">Bàn:</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Chọn bàn" /></SelectTrigger>
                <SelectContent onValueChange={() => {}}>
                  {mockTables.map(t => <SelectItem key={t.id} value={t.number}>Bàn {t.number}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockMenuItems.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => addToCart(item)}>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <div className="font-bold truncate">{item.name}</div>
                  <div className="text-orange-600 font-black">${item.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b"><h3 className="font-bold">Đơn hàng hiện tại</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <div>
                  <div className="font-bold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-400">${item.price} x {item.quantity}</div>
                </div>
                <div className="font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between text-xl font-black mb-4">
              <span>Tổng cộng:</span>
              <span className="text-orange-600">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-orange-600 h-14 text-lg font-bold" onClick={() => setShowCheckout(true)}>THANH TOÁN</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
