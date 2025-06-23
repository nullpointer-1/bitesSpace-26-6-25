// src/components/vendor/OrderQueue.tsx

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, User, Phone, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Client } from "@stomp/stompjs";
import axios from "axios";

// Interface for Order (match your backend's OrderDocument closely)
interface Order {
  id: string; // This should match OrderDocument.id (MongoDB's _id)
  orderId: string; // This should match OrderDocument.orderId (your custom UUID)
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string; // <--- CHANGED: Updated type from number to string for consistency with backend
    productName: string; // <--- CHANGED: Renamed from 'name'
    priceAtOrder: number; // <--- CHANGED: Renamed from 'price'
    quantity: number;
    imageUrl: string;
    isVeg: boolean;
 }>;
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

// Define props for OrderQueue
interface OrderQueueProps {
  stompClient: Client | null;
  vendorUsername: string;
  vendorId: string;
}

const OrderQueue = ({ stompClient, vendorUsername, vendorId }: OrderQueueProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Helper for sorting orders by status (priority for active states) and then by time
  const sortOrders = (ordersArray: Order[]) => {
    // Define a custom order for statuses if needed, otherwise rely on default sort
    // For example, to ensure new orders are always at the top of PLACED, etc.
    return [...ordersArray].sort((a, b) => {
      // Example sorting: Newest PLACED orders first, then older PREPARING, etc.
      // Adjust this logic if you have a specific sorting preference for your columns.
      if (a.status === "PLACED" && b.status === "PLACED") {
        return new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
      }
      return 0; // Maintain existing order for other statuses or if statuses are different
    });
  };

  useEffect(() => {
    if (stompClient) {
      console.log("OrderQueue: stompClient prop received. Connected status:", stompClient.connected);
    } else {
      console.log("OrderQueue: stompClient prop is null.");
    }
  }, [stompClient]);

  // Function to fetch initial orders when the component mounts
  useEffect(() => {
    const fetchInitialOrders = async () => {
      try {
        const response = await axios.get<Order[]>(`http://localhost:8081/api/orders/vendor/${vendorId}`);
        // Apply sorting to initial orders
        setOrders(sortOrders(response.data.map(order => ({
            ...order,
            status: order.status as Order['status']
        }))));
        console.log("Initial orders fetched:", response.data);
      } catch (error) {
        console.error("Failed to fetch initial orders:", error);
        toast({ title: "Error", description: "Failed to load current orders.", variant: "destructive" });
      }
    };

    if (vendorId) {
      fetchInitialOrders();
    }
  }, [vendorId]);

  // WebSocket subscription for new orders and status updates
  useEffect(() => {
    if (stompClient && stompClient.connected && vendorUsername) {
      console.log(`OrderQueue: Subscribing to /topic/orders/${vendorUsername}`);
      const subscription = stompClient.subscribe(`/topic/orders/${vendorUsername}`, (message) => {
        const updatedOrder: Order = JSON.parse(message.body);
        console.log("Order update received via WebSocket:", updatedOrder);

        setOrders((prevOrders) => {
          const existingOrderIndex = prevOrders.findIndex(order => order.id === updatedOrder.id);
          let newOrdersArray;
          if (existingOrderIndex !== -1) {
            newOrdersArray = [...prevOrders];
            newOrdersArray[existingOrderIndex] = updatedOrder;
          } else {
            // If it's a completely new order, add it to the beginning
            newOrdersArray = [updatedOrder, ...prevOrders];
          }
          // Sort the updated array to ensure correct placement in columns
          return sortOrders(newOrdersArray);
        });

        const statusMessages = {
          PLACED: `New order #${updatedOrder.orderId.substring(0, 8)} received!`,
          PREPARING: `Order #${updatedOrder.orderId.substring(0, 8)} is now being prepared.`,
          READY_FOR_PICKUP: `Order #${updatedOrder.orderId.substring(0, 8)} is ready for pickup!`,
          COMPLETED: `Order #${updatedOrder.orderId.substring(0, 8)} completed.`,
          REJECTED: `Order #${updatedOrder.orderId.substring(0, 8)} has been rejected.`
        };
        toast({ title: "Order Update", description: statusMessages[updatedOrder.status], variant: "default" });
      });

      return () => {
        console.log(`OrderQueue: Unsubscribing from /topic/orders/${vendorUsername}`);
        subscription.unsubscribe();
      };
    } else {
      console.warn("OrderQueue: STOMP client not connected or vendorUsername not available for subscription. (Subscription skipped)");
    }
  }, [stompClient, vendorUsername]);

  // Central handler to decide between HTTP and WebSocket, with optimistic UI update
   const handleStatusChange = async (orderCustomId: string, currentOrderStatus: Order['status'], newStatus: Order['status']) => { // Changed param name to avoid confusion
    // 1. **Optimistic UI Update:** Immediately update the local state
    const prevOrdersState = orders; // Store the current state for potential rollback
    
     setOrders((prev) => {
   const updatedList = prev.map((order) =>
    // --- THE CRITICAL FIX IS HERE ---
    // Now correctly find the order in the local state by its custom UUID (order.orderId)
     order.orderId === orderCustomId ? { ...order, status: newStatus } : order
     );
     // Sort the list immediately after updating to ensure the card moves to the correct column
     return sortOrders(updatedList);
    });
    
     try {
   if (currentOrderStatus === "PLACED") {
    // For PLACED -> PREPARING/REJECTED, use HTTP endpoint
    // Send the custom orderId (UUID) in the URL path for backend lookup
     await axios.put(`http://localhost:8081/api/orders/${orderCustomId}/status`, { // <-- Send orderCustomId here
   newStatus: newStatus,
    vendorId: vendorId
     });
     console.log(`Successfully sent HTTP update for order ${orderCustomId} to ${newStatus}.`);
    } else {
    // For other status changes (PREPARING -> READY, READY -> COMPLETED), use WebSocket 'send'
    if (stompClient && stompClient.connected) {
     const destination = `/app/order.updateStatus`;
     const messageBody = {
     orderId: orderCustomId, // <-- Send orderCustomId here
    newStatus: newStatus,
     vendorId: vendorId,
     };
    
     stompClient.publish({
    destination: destination,
     body: JSON.stringify(messageBody),
     });
     console.log(`Successfully sent WebSocket update for order ${orderCustomId} to ${newStatus}.`);
     } else {
     throw new Error("STOMP client not connected for WebSocket update.");
     }
    }
   toast({ title: "Order Updated", description: `Order #${orderCustomId.substring(0, 8)} status changed to ${newStatus.replace(/_/g, ' ')}.`, variant: "success" });
    } catch (error) {
     console.error(`Failed to update order status for ${orderCustomId}:`, error);
    // 2. **Rollback UI:** Revert to previous state if API call fails
     setOrders(sortOrders(prevOrdersState)); // Rollback to the state before the optimistic update
    toast({ title: "Error", description: `Failed to update order status for #${orderCustomId.substring(0, 8)}. Please try again.`, variant: "destructive" });
     }
    };
  // Helper to get status color for badges and card borders
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "PLACED": return "bg-yellow-500 border-yellow-500"; // Added border color
      case "PREPARING": return "bg-blue-500 border-blue-500";
      case "READY_FOR_PICKUP": return "bg-green-500 border-green-500";
      case "COMPLETED": return "bg-gray-500 border-gray-500";
      case "REJECTED": return "bg-red-500 border-red-500";
      default: return "bg-gray-500 border-gray-500";
    }
  };

  // Helper component for rendering individual order cards (internal to OrderQueue)
  const OrderCard = ({ order, actions }: { order: Order; actions?: React.ReactNode }) => (
    <Card key={order.id} className={`border-l-4 ${getStatusColor(order.status).replace('bg-', 'border-l-')}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">#{order.orderId.substring(0, 8)}...</CardTitle>
          <Badge className={getStatusColor(order.status).split(' ')[0]}> {/* Use only bg- class */}
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
              <span>{item.productName} x{item.quantity}</span>
              <span>₹{item.priceAtOrder * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total: ₹{order.totalAmount}</span>
          <span className="text-sm text-gray-600">
            {order.status === "READY_FOR_PICKUP" ? "Ready!" : new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Filter orders by status for display sections
  const pendingOrders = orders.filter(order => order.status === "PLACED");
  const preparingOrders = orders.filter(order => order.status === "PREPARING");
  const readyOrders = orders.filter(order => order.status === "READY_FOR_PICKUP");
  const historicalOrders = orders.filter(order => order.status === "COMPLETED" || order.status === "REJECTED");


  return (
    <div className="space-y-6"> {/* This div creates vertical spacing between the main status sections */}
      {/* Pending Orders Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          Pending Orders ({pendingOrders.length})
        </h3>
        {/* This div controls the grid layout for cards within this section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.orderId, order.status, "PREPARING")}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(order.id, order.status, "REJECTED")}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                }
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 col-span-full">No pending orders.</p>
          )}
        </div>
      </div>

      {/* Preparing Orders Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Preparing Orders ({preparingOrders.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {preparingOrders.length > 0 ? (
            preparingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(order.orderId, order.status, "READY_FOR_PICKUP")}
                    className="w-full"
                  >
                    Mark as Ready
                  </Button>
                }
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 col-span-full">No orders currently being prepared.</p>
          )}
        </div>
      </div>

      {/* Ready Orders Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Ready for Pickup ({readyOrders.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {readyOrders.length > 0 ? (
            readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(order.orderId, order.status, "COMPLETED")}
                    className="w-full"
                    variant="outline"
                  >
                    Mark as Completed
                  </Button>
                }
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 col-span-full">No orders ready for pickup.</p>
          )}
        </div>
      </div>

      {/* NEW: Completed/Rejected Orders Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          Completed/Rejected Orders ({historicalOrders.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {historicalOrders.length > 0 ? (
            historicalOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 col-span-full">No completed or rejected orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderQueue;