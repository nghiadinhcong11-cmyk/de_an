import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import api from "../services/api";
import { Loader2, Plus } from "lucide-react";

export function OwnerMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/menu/categories"),
          api.get("/menu/products")
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Quản lý thực đơn</h1>
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          {categories.map(c => <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="text-4xl mb-2">🍽️</div>
                  <h4 className="font-bold">{p.name}</h4>
                  <p className="text-orange-600 font-bold">${p.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
