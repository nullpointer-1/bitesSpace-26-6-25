import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle, Clock, MapPin, Phone, Mail, Ticket, MessageSquare, XCircle } from "lucide-react"; // Import XCircle
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import QRCodeGenerator from "@/components/order/QRCodeGenerator";
import { toast } from "@/hooks/use-toast";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';

// Import your new components
import RaiseTicketModal from "@/components/order/RaiseTicketModal";
import OrderRatingModal from "@/components/order/OrderRatingModal";

// Define a type for the fetched order data to improve type safety
interface OrderItem {
  productId: number; // Corresponds to SQL product ID
  productName: string; // Denormalized name
  priceAtOrder: number; // Denormalized price per item at order time
  quantity: number;
  imageUrl: string;
  isVeg: boolean;
}

interface OrderData {
  id: string; // MongoDB's _id (ObjectId string)
  orderId: string; // Your custom generated UUID string (e.g., ORD123ABC)
  status: "PLACED" | "PREPARING" | "READY_FOR_PICKUP" | "COMPLETED" | "REJECTED"; // Use union type for status
  estimatedPickupTime: string; // ISO string from Instant
  shopId: number; // SQL Shop ID
  shopName: string; // Denormalized shop name
  shopAddress: string; // Denormalized shop address
  shopContactNumber?: string; // Made optional as it might not always be there
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  vendorId: number; // Added from OrderDocument
  vendorName: string; // Added from OrderDocument
}

const orderStatuses = [
  { status: "PLACED", label: "Order Confirmed" },
  { status: "PREPARING", label: "Preparing Food" },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { status: "COMPLETED", label: "Order Completed" }
];

const OrderTrackingPage = () => {
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const stompClient = useRef<Client | null>(null);

  // State for modals
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Function to fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get<OrderData>(`http://localhost:8081/api/orders/${paramOrderId}`);
        setOrder(response.data);

        // Set initial progress based on status
        const initialStatusIndex = orderStatuses.findIndex(s => s.status === response.data.status);
        if (initialStatusIndex !== -1) {
          setProgress((initialStatusIndex + 1) * (100 / orderStatuses.length));
        }

      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (paramOrderId) {
      fetchOrder();
    }
  }, [paramOrderId]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!paramOrderId) {
      console.log("Order ID not available for WebSocket connection yet.");
      return;
    }

    console.log(`Attempting WebSocket connection for order: ${paramOrderId}`);

    // Deactivate existing client if it exists to prevent multiple connections
    if (stompClient.current) {
        if (stompClient.current.connected) {
            console.log("STOMP client already connected, deactivating old one before new connection.");
            stompClient.current.deactivate();
        }
        stompClient.current = null; // Clear old client reference
    }


    stompClient.current = new Client({
      brokerURL: "ws://localhost:8081/ws",
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      debug: function (str) {
        // console.log("STOMP Customer:", str); // Uncomment for detailed STOMP logging
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.current.onConnect = () => {
      console.log("Connected to WebSocket for customer order:", paramOrderId);

      // Subscribe to the order-specific topic
      stompClient.current?.subscribe(`/topic/orders/${paramOrderId}`, (message) => {
        const updatedOrder: OrderData = JSON.parse(message.body);
        console.log("New order update received via WebSocket:", updatedOrder);

        // Update the order state
        setOrder(updatedOrder);

        // Update progress based on new status
        const newStatusIndex = orderStatuses.findIndex(s => s.status === updatedOrder.status);
        if (newStatusIndex !== -1) {
          setProgress((newStatusIndex + 1) * (100 / orderStatuses.length));
          toast({
            title: "Order Update!",
            description: `Your order is now: ${orderStatuses[newStatusIndex].label}`,
            variant: "default", // You can customize toast variant
          });
        }
      });
    };

    stompClient.current.onStompError = (frame) => {
      console.error("Broker reported STOMP error for customer order:", frame.headers["message"]);
      console.error("Additional STOMP details:", frame.body);
      toast({ title: "WebSocket Error", description: "Could not connect to real-time updates for your order.", variant: "destructive" });
    };

    stompClient.current.onWebSocketClose = (event) => {
      console.log("WebSocket closed for customer order:", event);
    };

    stompClient.current.onWebSocketError = (event) => {
      console.error("WebSocket error for customer order:", event);
    };

    stompClient.current.activate();

    // Cleanup function to deactivate STOMP client on component unmount
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.deactivate();
        console.log("Disconnected from WebSocket for customer order:", paramOrderId);
      }
    };
  }, [paramOrderId]); // Dependency on paramOrderId ensures connection is made for the specific order

  // Simulate preparation progress if status is "PREPARING"
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    // Only simulate progress if the status is PREPARING and not yet 100%
    if (order && order.status === "PREPARING" && progress < 95) { // Cap at 95%
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5; // Slower progress
          // Cap the simulated progress, actual status change comes from backend via WebSocket
          if (newProgress >= 95) {
            return 95; // Stop simulating close to 100
          }
          return newProgress;
        });
      }, 5000); // Update every 5 seconds
    } else if (order && order.status !== "PREPARING" && interval) {
        // If status changes away from PREPARING, stop the interval
        clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order?.status, progress]); // Re-run when order status or progress changes

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return orderStatuses.findIndex(s => s.status === order.status);
  };

  const getEstimatedTimeRemaining = () => {
    if (!order || !order.estimatedPickupTime) return null;
    const pickupTime = new Date(order.estimatedPickupTime).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = Math.round((pickupTime - currentTime) / (1000 * 60));
    return diffMinutes > 0 ? diffMinutes : 0;
  };

  if (loading) {
    return <div className="text-center py-10">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-10">No order found with ID: {paramOrderId}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/user/browse/stalls">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Track Order</h1>
            </div>
            <Badge
              variant={order.status === "READY_FOR_PICKUP" ? "default" : "secondary"}
              className="capitalize"
            >
              {order.status.replace(/_/g, ' ').toLowerCase()} {/* Format status for display */}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Order #{order.orderId}</h2> {/* Use order.orderId (UUID) */}
                  <Badge
                    variant={order.status === "READY_FOR_PICKUP" ? "default" : "secondary"}
                    className="capitalize px-3 py-1"
                  >
                    {order.status === "READY_FOR_PICKUP" ? "Ready for Pickup!" : order.status.replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                </div>

                {order.status === "PREPARING" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Preparation Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-600 mt-2">
                      Estimated time remaining: ~{getEstimatedTimeRemaining()} minutes
                    </p>
                  </div>
                )}

                {order.status === "READY_FOR_PICKUP" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Your order is ready for pickup!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Please collect your order within the next 10 minutes.
                    </p>
                  </div>
                )}

                {order.status === "COMPLETED" && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-blue-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Order Completed!</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Thank you for your order! We hope you enjoyed your meal.
                    </p>
                    {/* New Buttons for Completed Orders */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsRatingModalOpen(true)}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Rate Order
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsTicketModalOpen(true)}
                        >
                            <Ticket className="h-4 w-4 mr-2" />
                            Raise a Ticket
                        </Button>
                    </div>
                  </div>
                )}
                {/* Conditionally render Rejected message */}
                {order.status === "REJECTED" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-5 w-5" /> {/* XCircle icon added */}
                            <span className="font-medium">Order Rejected</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                            Unfortunately, your order could not be fulfilled. Please contact the shop or try again.
                        </p>
                    </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                <div className="space-y-4">
                  {orderStatuses.map((statusItem, index) => {
                    const currentIndex = getCurrentStatusIndex();
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={statusItem.status} className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isCurrent ? "text-orange-600" : isCompleted ? "text-green-600" : "text-gray-500"
                          }`}>
                            {statusItem.label}
                          </p>
                          {/* You might fetch actual timestamps from backend for "time" */}
                          {/* For now, just show a placeholder or remove if not dynamically populated */}
                          {statusItem.status === "PLACED" && <p className="text-sm text-gray-500">Just now</p>}
                          {statusItem.status === "PREPARING" && <p className="text-sm text-gray-500">In progress</p>}
                          {statusItem.status === "READY_FOR_PICKUP" && <p className="text-sm text-gray-500">Awaiting pickup</p>}
                          {statusItem.status === "COMPLETED" && <p className="text-sm text-gray-500">Delivered</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {/* Defensive rendering for productName */}
                          <h4 className="font-medium">{item.productName || 'Unknown Product'}</h4>
                          <Badge variant={item.isVeg ? "secondary" : "destructive"} className="text-xs">
                            {item.isVeg ? "Veg" : "Non-Veg"}
                          </Badge>
                        </div>
                        {/* Defensive rendering for quantity */}
                        <p className="text-sm text-gray-600">Qty: {item.quantity ?? 0}</p>
                      </div>
                      {/* Defensive rendering for priceAtOrder * quantity */}
                      <p className="font-medium">
                        ₹{(item.priceAtOrder ?? 0) * (item.quantity ?? 0)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">Total Amount</span>
                    {/* Defensive rendering for totalAmount */}
                    <span className="font-bold text-lg">₹{order.totalAmount ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pickup Information and QR Code */}
          <div className="space-y-6">
            {/* QR Code */}
            <QRCodeGenerator orderId={order.orderId} />

            {/* Pickup Information */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">{order.shopName}</h4>
                    <p className="text-sm text-gray-600">{order.shopAddress}</p>
                  </div>

                  {order.shopContactNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${order.shopContactNumber}`} className="text-blue-600 hover:underline">
                        {order.shopContactNumber}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="text-gray-600">{order.customerEmail}</span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Pickup Window</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.status === "READY_FOR_PICKUP"
                        ? "Now - Next 10 minutes"
                        : `In ~${getEstimatedTimeRemaining()} minutes`
                      }
                    </p>
                  </div>

                  {order.status === "READY_FOR_PICKUP" && (
                    <Button className="w-full mt-4" size="lg" disabled>
                      Confirm Pickup
                    </Button>
                  )}
                  {order.status === "COMPLETED" && (
                    <Button className="w-full mt-4" size="lg" disabled>
                      Order Picked Up
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {order && (
        <RaiseTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          orderId={order.orderId}
          shopId={order.shopId} // Pass shopId
          stallName={order.shopName}
        />
      )}

      {/* Order Rating Modal */}
      {order && (
        <OrderRatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          orderId={order.orderId}
          shopId={order.shopId} // Pass shopId
          stallName={order.shopName}
        />
      )}
    </div>
  );
};

export default OrderTrackingPage;
