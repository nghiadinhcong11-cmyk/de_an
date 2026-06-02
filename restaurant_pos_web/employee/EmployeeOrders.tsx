import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Clock, CheckCircle2 } from "lucide-react";
import { mockOrders, type Order } from "../data/mockData";

const statusColors: any = {
  sent: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-gray-100 text-gray-800",
  completed: "bg-green-200 text-green-900",
};

export function EmployeeOrders() {
  const [orders, setOrders] = useState(mockOrders);

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
  };

  const getOrdersByStatus = (status: Order["status"] | "all") => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  };

  const renderOrderCard = (order: Order) => (
    <Card key={order.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{order.id}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Table {order.tableNumber}</p>
          </div>
          <Badge className={statusColors[order.status]}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-orange-600">${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
          </div>

          {order.status !== "completed" && (
            <div className="grid grid-cols-2 gap-2 pt-3">
              {order.status === "sent" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "preparing")}
                  className="col-span-2 bg-orange-600 hover:bg-orange-700"
                >
                  Start Preparing
                </Button>
              )}
              {order.status === "preparing" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "ready")}
                  className="col-span-2 bg-orange-600 hover:bg-orange-700"
                >
                  Mark as Ready
                </Button>
              )}
              {order.status === "ready" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "served")}
                  className="col-span-2 bg-orange-600 hover:bg-orange-700"
                >
                  Mark as Served
                </Button>
              )}
              {order.status === "served" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "completed")}
                  className="col-span-2 bg-orange-600 hover:bg-orange-700"
                >
                  Complete Order
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-gray-600 mt-1">Track and manage all orders</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Pending</div>
                <div className="text-2xl font-bold">
                  {orders.filter((o) => o.status === "sent" || o.status === "preparing").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ... Other stats truncated for brevity ... */}
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="served">Served</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getOrdersByStatus("all").map(renderOrderCard)}
              </div>
            </TabsContent>
            {/* ... other tab contents ... */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
