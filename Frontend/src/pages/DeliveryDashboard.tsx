
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle, Navigation, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DeliveryOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  stallName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered";
  estimatedTime: string;
  earnings: number;
  distance: string;
}

const mockOrders: DeliveryOrder[] = [
  {
    id: "1",
    orderId: "ORD123ABC",
    customerName: "John Doe",
    customerPhone: "+91 98765 43210",
    stallName: "Spice Paradise",
    pickupAddress: "123 Food Street, Downtown",
    deliveryAddress: "456 Home Avenue, Sector 5",
    status: "assigned",
    estimatedTime: "25 min",
    earnings: 50,
    distance: "3.2 km"
  },
  {
    id: "2",
    orderId: "ORD456DEF",
    customerName: "Jane Smith",
    customerPhone: "+91 87654 32109",
    stallName: "Burger Junction",
    pickupAddress: "789 Mall Road, City Center",
    deliveryAddress: "321 Park Street, Sector 3",
    status: "picked_up",
    estimatedTime: "15 min",
    earnings: 40,
    distance: "2.1 km"
  }
];

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockOrders);
  const [isOnline, setIsOnline] = useState(true);

  const updateOrderStatus = (orderId: string, newStatus: DeliveryOrder["status"]) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "default";
      case "picked_up": return "secondary";
      case "in_transit": return "default";
      case "delivered": return "secondary";
      default: return "secondary";
    }
  };

  const todayEarnings = orders.reduce((total, order) => total + order.earnings, 0);
  const completedDeliveries = orders.filter(order => order.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Delivery Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={isOnline ? "default" : "outline"}
                onClick={() => setIsOnline(!isOnline)}
              >
                {isOnline ? "Online" : "Offline"}
              </Button>
              <Avatar>
                <AvatarFallback>DP</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{todayEarnings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedDeliveries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isOnline ? "text-green-600" : "text-gray-600"}`}>
                {isOnline ? "Online" : "Offline"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusColor(order.status)} className="capitalize">
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">Order #{order.orderId}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{order.earnings}</p>
                      <p className="text-sm text-gray-600">{order.distance}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Pickup from</h4>
                      <p className="text-sm text-gray-600 mb-1">{order.stallName}</p>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.pickupAddress}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Deliver to</h4>
                      <p className="text-sm text-gray-600 mb-1">{order.customerName}</p>
                      <p className="text-sm flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" />
                        {order.deliveryAddress}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">ETA: {order.estimatedTime}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      {order.status === "assigned" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "picked_up")}
                        >
                          Mark Picked Up
                        </Button>
                      )}
                      {order.status === "picked_up" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;