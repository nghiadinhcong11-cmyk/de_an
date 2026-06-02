import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Plus, Minus, ShoppingCart, Utensils } from "lucide-react";
import api from "../services/api";

export function TableOrderPage() {
  const { tableId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/qrordering/menu/${tableId}`);
        setData(res.data);
      } catch (err) {
        console.error("Không tìm thấy bàn");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [tableId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!data) return <div className="p-8 text-center font-bold">Lỗi: Bàn không tồn tại</div>;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="bg-orange-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Bàn {data.tableNumber}</h1>
        <p className="opacity-80">{data.branchName}</p>
      </div>

      <div className="p-4 space-y-4">
        {data.products.map((p: any) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold">{p.name}</h4>
                <p className="text-orange-600">${p.price}</p>
              </div>
              <Button size="sm" className="bg-orange-600 rounded-full h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
