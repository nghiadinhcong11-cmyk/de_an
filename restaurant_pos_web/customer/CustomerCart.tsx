import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Minus, Trash2, Tag, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function CustomerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([
    { id: "1", name: "Classic Burger", price: 12.99, quantity: 2 },
    { id: "2", name: "Coca Cola", price: 2.99, quantity: 2 },
  ]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const applyVoucher = () => {
    if (voucherCode.toUpperCase() === "WELCOME10") {
      setAppliedVoucher({ code: voucherCode, discount: 0.1 });
      setVoucherCode("");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedVoucher ? subtotal * appliedVoucher.discount : 0;
  const tax = (subtotal - discount) * 0.085;
  const total = subtotal - discount + tax;

  const handlePlaceOrder = () => {
    setShowCheckout(false);
    navigate("/customer/orders");
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold">Giỏ hàng của tôi</h2>
        <p className="text-sm text-gray-600 mt-1">{cart.length} món ăn</p>
      </div>

      <div className="p-4 space-y-4">
        {cart.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="mb-2 font-bold">Giỏ hàng trống</h3>
              <p className="text-gray-600 mb-4">Hãy chọn món ăn từ thực đơn</p>
              <Button onClick={() => navigate("/customer/menu")} className="bg-orange-600">Xem thực đơn</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🍽️</div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{item.name}</h4>
                        <div className="text-sm text-gray-600">${item.price.toFixed(2)} mỗi món</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-orange-200 text-orange-600"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-orange-600 text-white"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Voucher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Áp dụng Voucher
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-bold text-green-900">{appliedVoucher.code}</div>
                        <div className="text-sm text-green-700">
                          Đã giảm {(appliedVoucher.discount * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAppliedVoucher(null)}
                      className="text-green-700 hover:bg-green-100"
                    >
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá (Vd: WELCOME10)"
                      value={voucherCode}
                      onChange={(e: any) => setVoucherCode(e.target.value)}
                    />
                    <Button onClick={applyVoucher} className="bg-orange-600">Áp dụng</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế (8.5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-bold text-orange-600 text-lg">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-bold" size="lg" onClick={() => setShowCheckout(true)}>
              Tiến hành đặt món
            </Button>
          </>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold">Chọn phương thức thanh toán</DialogTitle>
            <DialogDescription>Vui lòng chọn cách thức bạn muốn thanh toán</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-orange-200"
              onClick={() => {
                setShowCheckout(false);
                setShowQR(true);
              }}
            >
              <QrCode className="w-6 h-6 mr-3 text-orange-600" />
              <div className="text-left">
                <div className="font-bold">VietQR</div>
                <div className="text-sm text-gray-500">Quét mã QR để thanh toán</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-orange-200"
              onClick={handlePlaceOrder}
            >
              <span className="text-2xl mr-3">💰</span>
              <div className="text-left">
                <div className="font-bold">Thanh toán tại quầy</div>
                <div className="text-sm text-gray-500">Thanh toán sau khi dùng bữa</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-center">Quét mã để thanh toán</DialogTitle>
            <DialogDescription className="text-center">Tổng cộng: ${total.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 flex items-center justify-center mb-4">
              <QrCode className="w-48 h-48 text-orange-600" />
            </div>
            <div className="text-center text-sm text-gray-600 mb-4">
              Dùng ứng dụng ngân hàng của bạn quét mã này để hoàn tất
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handlePlaceOrder}>
              Tôi đã thanh toán thành công
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
