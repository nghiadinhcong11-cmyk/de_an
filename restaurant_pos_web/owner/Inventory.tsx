import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Plus, Search, AlertTriangle, Package, History, ArrowUpRight, ArrowDownRight, Edit, Trash2 } from "lucide-react";
import { mockIngredients } from "../data/mockData";

export function OwnerInventory() {
  const [ingredients, setIngredients] = useState(mockIngredients);
  const [searchTerm, setSearchTerm] = useState("");

  const lowStockItems = ingredients.filter(i => i.status !== 'In Stock');

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Track and manage your restaurant ingredients</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" /> Add Ingredient
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-400">TOTAL INGREDIENTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{ingredients.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-500">LOW STOCK ITEMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-400">OUT OF STOCK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-400">{ingredients.filter(i => i.currentQty === 0).length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-orange-600">INVENTORY VALUE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-600">$4,250.00</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ingredients List</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search ingredients..."
                    className="pl-9 h-9 border-none bg-gray-100"
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold text-center">Unit</TableHead>
                    <TableHead className="font-bold text-center">Quantity</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold">{item.name}</TableCell>
                      <TableCell className="text-center text-gray-500 uppercase text-xs">{item.unit}</TableCell>
                      <TableCell className="text-center font-black">{item.currentQty}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          item.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                          item.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        } border-none`}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-orange-600"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & History */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-red-100">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle className="text-lg">Critical Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <div className="font-bold text-red-900">{item.name}</div>
                    <div className="text-xs text-red-700">Only {item.currentQty} {item.unit} left (Min: {item.minQty})</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-red-200 text-red-700 bg-white">Restock</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                <CardTitle className="text-lg">Recent History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t border-gray-50">
              <div className="divide-y divide-gray-50">
                {[
                  { icon: ArrowUpRight, color: 'text-green-600', label: 'Stock In', item: 'Burger Buns', qty: '+500', time: '1h ago' },
                  { icon: ArrowDownRight, color: 'text-orange-600', label: 'Used', item: 'Beef Patty', qty: '-42', time: '2h ago' },
                  { icon: ArrowDownRight, color: 'text-orange-600', label: 'Used', item: 'Tomato', qty: '-5', time: '4h ago' },
                ].map((log, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${log.color}`}><log.icon className="w-4 h-4" /></div>
                       <div>
                         <div className="text-sm font-bold">{log.item}</div>
                         <div className="text-[10px] text-gray-400 uppercase font-black">{log.label} • {log.time}</div>
                       </div>
                    </div>
                    <div className={`font-black ${log.color}`}>{log.qty}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-50">
                <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-orange-600">VIEW ALL TRANSACTIONS</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
