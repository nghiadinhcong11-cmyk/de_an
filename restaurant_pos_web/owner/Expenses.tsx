import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, DollarSign, Wallet, Calendar, User, Trash2 } from "lucide-react";
import { mockExpenses } from "../data/mockData";

export function OwnerExpenses() {
  const [expenses] = useState(mockExpenses);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Business Expenses</h1>
          <p className="text-gray-500">Track all operational costs and spending</p>
        </div>
        <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> Log Expense</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'TODAY', val: '$120', color: 'text-orange-600' },
          { label: 'THIS MONTH', val: '$3,420', color: 'text-gray-900' },
          { label: 'TOTAL YEAR', val: '$45,000', color: 'text-gray-900' },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
            <CardContent className="pt-6">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label} EXPENSES</div>
                <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Title & Category</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Logged By</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-gray-900">{e.title}</div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase mt-1 border-gray-100 text-gray-400">{e.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-orange-600 text-lg">${e.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-gray-500 font-medium">{new Date(e.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs font-bold text-gray-400 uppercase">{e.createdBy}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
