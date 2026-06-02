import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Plus, Percent, DollarSign, Gift } from "lucide-react";
import { mockVouchers } from "../data/mockData";

export function OwnerVouchers() {
  const [vouchers, setVouchers] = useState(mockVouchers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-4 h-4" />;
      case "fixed":
        return <DollarSign className="w-4 h-4" />;
      case "free-item":
        return <Gift className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Voucher Management</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional vouchers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Voucher</DialogTitle>
              <DialogDescription>Set up a new promotional voucher</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="voucherCode">Voucher Code</Label>
                <Input id="voucherCode" placeholder="SUMMER2026" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucherType">Voucher Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent onValueChange={() => {}}>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free-item">Free Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucherValue">Value</Label>
                <Input id="voucherValue" type="number" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucherDesc">Description</Label>
                <Textarea id="voucherDesc" placeholder="Describe the voucher..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input id="validFrom" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To</Label>
                  <Input id="validTo" type="date" />
                </div>
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Create Voucher</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher: any) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded">{voucher.code}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getVoucherIcon(voucher.type)}
                      <span className="capitalize">{voucher.type.replace("-", " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {voucher.type === "percentage"
                      ? `${voucher.value}%`
                      : voucher.type === "fixed"
                      ? `$${voucher.value}`
                      : "Free Item"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{voucher.description}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(voucher.validFrom).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(voucher.validTo).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={voucher.status === "active" ? "default" : "secondary"}>
                      {voucher.status}
                    </Badge>
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
