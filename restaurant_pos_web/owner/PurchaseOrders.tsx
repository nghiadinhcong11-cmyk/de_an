import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, ShoppingCart, Clock, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { mockPurchaseOrders } from "../data/mockData";

export function OwnerPurchaseOrders() {
  const [orders] = useState(mockPurchaseOrders);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Purchase Orders</h1>
          <p className="text-gray-500">Track raw material intake from suppliers</p>
        </div>
        <Button className="bg-orange-600 font-bold shadow-lg shadow-orange-200"><Plus className="w-4 h-4 mr-2" /> New Purchase</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL ORDERS', val: orders.length, color: 'text-gray-900' },
          { label: 'PENDING', val: orders.filter(o => o.status === 'Pending').length, color: 'text-orange-600' },
          { label: 'COMPLETED', val: orders.filter(o => o.status === 'Completed').length, color: 'text-green-600' },
          { label: 'PURCHASE VALUE', val: '$14,500', color: 'text-gray-900' },
        ].map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
             <CardContent className="pt-6">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold">Order #</TableHead>
                <TableHead className="font-bold">Supplier</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="group">
                  <TableCell className="font-black text-xs">{o.orderNumber}</TableCell>
                  <TableCell className="font-bold">{o.supplierName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {o.status === 'Pending' ? <Clock className="w-3.5 h-3.5 text-orange-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                      <span className={`text-xs font-black uppercase ${o.status === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>{o.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-gray-900">${o.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="sm" className="font-bold gap-1 text-gray-400 group-hover:text-orange-600 transition-colors">Details <ChevronRight className="w-3 h-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
