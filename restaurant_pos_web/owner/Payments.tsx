import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { QrCode, Printer, CreditCard } from "lucide-react";

export function OwnerPayments() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Payment Settings</h1>
        <p className="text-gray-600 mt-1">Configure payment methods and settings</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              <CardTitle>VietQR Configuration</CardTitle>
            </div>
            <CardDescription>Set up QR code payment integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable VietQR</Label>
                <p className="text-sm text-gray-500">Accept payments via QR code</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" defaultValue="Vietcombank" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" defaultValue="1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input id="accountName" defaultValue="THE GREEN BISTRO" />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Save QR Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <CardTitle>Card Payment</CardTitle>
            </div>
            <CardDescription>Configure card payment terminals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Accept Card Payments</Label>
                <p className="text-sm text-gray-500">Enable credit/debit card payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input id="merchantId" placeholder="Enter your merchant ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terminalId">Terminal ID</Label>
              <Input id="terminalId" placeholder="Enter terminal ID" />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Save Card Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-orange-600" />
              <CardTitle>Receipt Printer</CardTitle>
            </div>
            <CardDescription>Configure receipt printer settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Print Receipt</Label>
                <p className="text-sm text-gray-500">Automatically print after payment</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="printerName">Printer Name</Label>
              <Input id="printerName" defaultValue="EPSON TM-T88VI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Input id="receiptFooter" defaultValue="Thank you for dining with us!" />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Test Print</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure tax rates and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Tax in Prices</Label>
                <p className="text-sm text-gray-500">Show prices with tax included</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" defaultValue="8.5" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax Identification Number</Label>
              <Input id="taxId" placeholder="Enter your tax ID" />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Save Tax Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
