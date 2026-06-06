import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Search, Info } from "lucide-react";
import api from "../services/api";
import { Input } from "../components/ui/input";

export function EmployeePOS() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/menu/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu thực đơn");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header chỉ để quan sát */}
      <div className="bg-white border-b border-gray-200 p-4 md:px-8 flex flex-col md:flex-row items-center justify-between sticky top-0 z-10 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold">
                <Search className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Tra cứu thực đơn</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Danh mục món ăn & Giá bán hệ thống</p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
             <Input
                placeholder="Tìm tên món ăn..."
                className="pl-10 h-11 bg-gray-50 border-none rounded-xl font-bold"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-blue-100">
             <Info className="w-3.5 h-3.5" />
             Chế độ quan sát (Thanh toán trên Mobile)
          </div>
      </div>

      {/* Main Content: Product Catalog */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredProducts.map(item => (
                  <Card
                    key={item.id}
                    className="rounded-[32px] overflow-hidden border-none shadow-sm bg-white group hover:shadow-xl transition-all duration-300"
                  >
                      <div className="h-40 bg-orange-50 flex items-center justify-center text-6xl relative overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : "🍽️"}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                      </div>
                      <CardContent className="p-5">
                        <div className="font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">{item.name}</div>
                        <div className="flex justify-between items-end mt-4">
                           <div>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá bán niêm yết</p>
                              <p className="text-orange-600 font-black text-xl leading-none">{item.price.toLocaleString("vi-VN")}đ</p>
                           </div>
                        </div>
                      </CardContent>
                  </Card>
              ))}
          </div>

          {filteredProducts.length === 0 && (
              <div className="py-40 text-center opacity-30">
                  <Search className="w-20 h-20 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest">Không tìm thấy món ăn</p>
              </div>
          )}
      </div>
    </div>
  );
}


