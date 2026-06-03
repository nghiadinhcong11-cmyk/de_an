import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import api from "../services/api";

export function TableOrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/qrordering/menu/${tableId}`);
        setData(res.data);
        localStorage.setItem("current_table_id", tableId || "");

        // Load cart from local storage
        const savedCart = localStorage.getItem("customer_cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error("Không tìm thấy bàn");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [tableId]);

  const updateCart = (product: any, delta: number) => {
    let newCart = [...cart];
    const index = newCart.findIndex((i) => i.id === product.id);

    if (index >= 0) {
      newCart[index].quantity += delta;
      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
      }
    } else if (delta > 0) {
      newCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    setCart(newCart);
    localStorage.setItem("customer_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const getQuantity = (productId: string) => {
    return cart.find((i) => i.id === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
        <Loader2 className="animate-spin text-orange-600 w-12 h-12 mb-4" />
        <p className="font-black text-orange-900 animate-pulse uppercase">Đang kết nối với bàn...</p>
    </div>
  );

  if (!data) return <div className="p-8 text-center font-bold text-red-500">Lỗi: Bàn không tồn tại</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-orange-600 p-8 pt-12 text-white rounded-b-[40px] shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-black">Bàn {data.tableNumber}</h1>
                <p className="opacity-90 font-bold uppercase text-xs tracking-widest mt-1">{data.branchName}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <ShoppingBag className="w-6 h-6" />
            </div>
        </div>
      </div>

      {/* Categories / Welcome */}
      <div className="p-6">
          <h2 className="text-xl font-black text-gray-900 mb-6">Thực đơn hôm nay</h2>

          <div className="space-y-4">
            {data.products.map((p: any) => {
              const qty = getQuantity(p.id);
              return (
                <Card key={p.id} className="border-none shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                        🍽️
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 truncate">{p.name}</h4>
                      <p className="text-orange-600 font-black text-lg">${p.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl">
                      {qty > 0 ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateCart(p, -1)}
                            className="h-8 w-8 bg-white rounded-lg shadow-sm text-orange-600"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-black text-sm w-4 text-center">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateCart(p, 1)}
                            className="h-8 w-8 bg-white rounded-lg shadow-sm text-orange-600"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => updateCart(p, 1)}
                          className="bg-gray-900 hover:bg-orange-600 text-white rounded-lg h-9 px-4 font-black text-xs uppercase"
                        >
                          Thêm
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      </div>

      {/* Floating Action Bar */}
      {totalItems > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-50">
              <Button
                onClick={() => navigate('/customer/cart')}
                className="w-full h-16 bg-gray-900 hover:bg-black text-white rounded-[24px] shadow-2xl flex items-center justify-between px-6 group"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black">
                          {totalItems}
                      </div>
                      <div className="text-left">
                          <p className="text-[10px] font-black uppercase opacity-60 leading-none">Xem giỏ hàng</p>
                          <p className="text-lg font-black tracking-tight">${totalPrice.toFixed(2)}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 font-black text-sm uppercase">
                      Tiếp tục <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
              </Button>
          </div>
      )}
    </div>
  );
}
