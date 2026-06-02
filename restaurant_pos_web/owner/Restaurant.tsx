import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { mockRestaurant } from "../data/mockData";

export function OwnerRestaurant() {
  const [restaurant, setRestaurant] = useState(mockRestaurant);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Restaurant Management</h1>
        <p className="text-gray-600 mt-1">Manage your restaurant information and settings</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>Update your restaurant's basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={restaurant.name}
                  onChange={(e: any) => setRestaurant({ ...restaurant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo (Emoji)</Label>
                <Input
                  id="logo"
                  value={restaurant.logo}
                  onChange={(e: any) => setRestaurant({ ...restaurant, logo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={restaurant.address}
                onChange={(e: any) => setRestaurant({ ...restaurant, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={restaurant.phone}
                  onChange={(e: any) => setRestaurant({ ...restaurant, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={restaurant.email}
                  onChange={(e: any) => setRestaurant({ ...restaurant, email: e.target.value })}
                />
              </div>
            </div>

            <Button className="bg-orange-600 hover:bg-orange-700">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
            <CardDescription>Configure business hours and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input id="openTime" type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input id="closeTime" type="time" defaultValue="22:00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" defaultValue="8.5" step="0.1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceCharge">Service Charge (%)</Label>
              <Input id="serviceCharge" type="number" defaultValue="10" step="0.1" />
            </div>

            <Button className="bg-orange-600 hover:bg-orange-700">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
