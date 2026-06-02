import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { mockMenuItems, type MenuItem } from "../data/mockData";

export function OwnerMenu() {
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = ["all", "food", "drinks", "desserts", "combo"];

  const getFilteredItems = (category: string) => {
    let filtered = menuItems;
    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category);
    }
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
              <DialogDescription>Create a new menu item</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input id="itemName" placeholder="Classic Burger" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemCategory">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent onValueChange={() => {}}>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemPrice">Price ($)</Label>
                  <Input id="itemPrice" type="number" step="0.01" placeholder="12.99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemCost">Cost ($)</Label>
                  <Input id="itemCost" type="number" step="0.01" placeholder="5.50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemDesc">Description</Label>
                <Textarea id="itemDesc" placeholder="Describe your menu item..." />
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Create Menu Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="drinks">Drinks</TabsTrigger>
              <TabsTrigger value="desserts">Desserts</TabsTrigger>
              <TabsTrigger value="combo">Combo</TabsTrigger>
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(category).map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold">{item.name}</h4>
                            <Badge variant="outline" className="mt-1">
                              {item.category}
                            </Badge>
                          </div>
                          <Badge variant={item.status === "available" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <div className="text-sm text-gray-500">Price</div>
                            <div className="font-semibold text-orange-600">${item.price.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Cost</div>
                            <div className="font-semibold">${item.cost.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Profit</div>
                            <div className="font-semibold text-green-600">
                              ${(item.price - item.cost).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
