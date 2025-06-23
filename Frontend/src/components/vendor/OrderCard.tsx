// src/components/vendor/OrderCard.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, User, Phone } from "lucide-react"; // Make sure all necessary icons are imported

// Re-defining the Order interface here for clarity, though it should be consistent
// with the one in OrderQueue.tsx or ideally imported from a shared types file.
interface Order {
  id: string; // MongoDB _id
  orderId: string; // Your custom UUID
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: "PLACED" | "PREPARING" | "READY_FOR_PICKUP" | "COMPLETED" | "REJECTED";
  orderTime: string;
  estimatedPickupTime: string;
  vendorId: string;
  shopId: string;
  shopName: string;
  vendorName: string;
  shopAddress: string;
}

interface OrderCardProps {
  order: Order;
  onAccept?: (orderId: string, currentStatus: Order['status'], newStatus: Order['status']) => void;
  onReject?: (orderId: string, currentStatus: Order['status'], newStatus: Order['status']) => void;
  onReady?: (orderId: string, currentStatus: Order['status'], newStatus: Order['status']) => void;
  onComplete?: (orderId: string, currentStatus: Order['status'], newStatus: Order['status']) => void;
  // No actions for historical orders, so no specific props needed for them
}

const OrderCard = ({ order, onAccept, onReject, onReady, onComplete }: OrderCardProps) => {

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "PLACED": return "bg-yellow-500 border-yellow-500";
      case "PREPARING": return "bg-blue-500 border-blue-500";
      case "READY_FOR_PICKUP": return "bg-green-500 border-green-500";
      case "COMPLETED": return "bg-gray-500 border-gray-500";
      case "REJECTED": return "bg-red-500 border-red-500";
      default: return "bg-gray-500 border-gray-500";
    }
  };

  return (
    <Card className={`border-l-4 ${getStatusColor(order.status).replace('bg-', 'border-l-')}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">#{order.orderId.substring(0, 8)}...</CardTitle>
          <Badge className={getStatusColor(order.status).split(' ')[0]}>
            {order.status.toUpperCase().replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          {order.customerName}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          {order.customerPhone}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total: ₹{order.totalAmount}</span>
          <span className="text-sm text-gray-600">
            {order.status === "READY_FOR_PICKUP" ? "Ready!" : `Placed: ${new Date(order.orderTime).toLocaleTimeString()}`}
          </span>
        </div>
        {/* Actions based on current order status */}
        {order.status === "PLACED" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onAccept && onAccept(order.id, order.status, "PREPARING")}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject && onReject(order.id, order.status, "REJECTED")}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        {order.status === "PREPARING" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onReady && onReady(order.id, order.status, "READY_FOR_PICKUP")}
              className="w-full"
            >
              Mark as Ready
            </Button>
          </div>
        )}

        {order.status === "READY_FOR_PICKUP" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onComplete && onComplete(order.id, order.status, "COMPLETED")}
              className="w-full"
              variant="outline"
            >
              Mark as Completed
            </Button>
          </div>
        )}
        {order.status === "COMPLETED" && (
          <p className="text-sm text-green-700 mt-4 text-center">Order completed.</p>
        )}
        {order.status === "REJECTED" && (
          <p className="text-sm text-red-700 mt-4 text-center">Order rejected.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;