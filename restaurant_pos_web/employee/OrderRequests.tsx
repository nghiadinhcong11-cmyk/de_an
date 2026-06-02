import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Bell, CheckCircle, XCircle, Clock, ChefHat, User } from "lucide-react";
import { mockOrderRequests } from "../data/mockData";

export function EmployeeOrderRequests() {
  const [requests] = useState(mockOrderRequests);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Customer Requests</h1>
          <p className="text-xs text-gray-500">Approve incoming QR orders</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'PENDING', val: requests.length, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'APPROVED', val: '142', color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'REJECTED', val: '2', color: 'text-red-600', bg: 'bg-red-100' },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
             <CardContent className="pt-6">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
                <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map(req => (
          <Card key={req.id} className="border-none shadow-md ring-2 ring-orange-500/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
             <div className="bg-orange-600 px-4 py-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                   <Bell className="w-4 h-4" />
                   <span className="text-sm font-black">NEW REQUEST</span>
                </div>
                <div className="text-[10px] font-bold opacity-80">{new Date(req.requestTime).toLocaleTimeString()}</div>
             </div>
             <CardContent className="pt-6 space-y-4">
                <div className="flex items-end justify-between border-b border-gray-50 pb-4">
                   <div>
                      <div className="text-3xl font-black">Table {req.tableNumber}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-bold mt-1 uppercase"><User className="w-3 h-3" /> {req.customerName}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Items</div>
                      <div className="text-xl font-black">{req.items.length}</div>
                   </div>
                </div>

                <div className="space-y-3 py-2">
                   {req.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-start">
                        <div>
                           <div className="text-sm font-bold">{item.quantity}x {item.name}</div>
                           {item.note && <div className="text-[10px] text-orange-500 font-medium italic italic">— "{item.note}"</div>}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-50">
                   <Button className="flex-1 bg-green-600 hover:bg-green-700 font-black text-xs uppercase shadow-lg shadow-green-100">
                      <ChefHat className="w-4 h-4 mr-2" /> Approve
                   </Button>
                   <Button variant="outline" className="w-12 border-red-100 text-red-500 hover:bg-red-50">
                      <XCircle className="w-5 h-5" />
                   </Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
         <div className="py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="text-4xl">☕</div>
            <div className="text-gray-400 font-bold">Everything clear! No pending requests.</div>
         </div>
      )}
    </div>
  );
}
