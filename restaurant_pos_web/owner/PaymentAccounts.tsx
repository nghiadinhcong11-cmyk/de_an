import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, CreditCard, Star, Trash2, Edit, CheckCircle } from "lucide-react";
import { mockPaymentAccounts } from "../data/mockData";

export function OwnerPaymentAccounts() {
  const [accounts] = useState(mockPaymentAccounts);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Payment Accounts</h1>
          <p className="text-gray-500">Manage bank accounts for VietQR integration</p>
        </div>
        <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Add Account</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {accounts.map(acc => (
           <Card key={acc.id} className={`border-none shadow-sm relative overflow-hidden ${acc.isDefault ? 'ring-2 ring-orange-500' : ''}`}>
              {acc.isDefault && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                   <Star className="w-3 h-3 fill-current" /> Default
                </div>
              )}
              <CardContent className="pt-8">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-xl italic uppercase">
                       {acc.bankName.substring(0, 3)}
                    </div>
                    <div>
                       <div className="text-lg font-black">{acc.bankName}</div>
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{acc.branch} Branch</div>
                    </div>
                 </div>
                 <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Number</div>
                    <div className="text-2xl font-black tracking-tighter">{acc.accountNumber.replace(/(\d{4})/g, '$1 ')}</div>
                    <div className="text-sm font-bold text-gray-600 uppercase">{acc.accountName}</div>
                 </div>
                 <div className="flex gap-2 border-t border-gray-50 pt-4">
                    <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-orange-600">Edit</Button>
                    <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500">Remove</Button>
                    {!acc.isDefault && <Button variant="ghost" size="sm" className="ml-auto font-black text-[10px] uppercase tracking-widest text-orange-600 hover:bg-orange-50">Set Default</Button>}
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
