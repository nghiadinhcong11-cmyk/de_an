import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, Search, Mail, Phone, MapPin, Edit, ExternalLink } from "lucide-react";
import { mockSuppliers } from "../data/mockData";

export function OwnerSuppliers() {
  const [suppliers] = useState(mockSuppliers);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Suppliers</h1>
          <p className="text-gray-500">Manage your raw material providers</p>
        </div>
        <Button className="bg-orange-600 font-bold"><Plus className="w-4 h-4 mr-2" /> New Supplier</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by name or email..." className="pl-10 h-10 border-none bg-gray-50" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold">Supplier Name</TableHead>
                <TableHead className="font-bold">Contact Info</TableHead>
                <TableHead className="font-bold">Address</TableHead>
                <TableHead className="font-bold text-center">Active Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="font-black text-gray-900">{s.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">ID: {s.id}</div>
                  </TableCell>
                  <TableCell className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><Mail className="w-3 h-3 text-orange-400" /> {s.email}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><Phone className="w-3 h-3 text-orange-400" /> {s.phone}</div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-medium">{s.address}</TableCell>
                  <TableCell className="text-center font-black text-orange-600">{s.totalOrders}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" className="font-bold gap-1 text-gray-400 hover:text-orange-600"><Edit className="w-4 h-4" /> Edit</Button>
                       <Button variant="outline" size="sm" className="font-bold gap-1 border-gray-100 text-gray-600"><ExternalLink className="w-4 h-4" /> Orders</Button>
                    </div>
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
