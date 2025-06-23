import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Mail, ShoppingBag , CreditCard} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Still needed for other inputs if any
import { Label } from "@/components/ui/label"; // Still needed for other labels if any
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext'; // Import useUser hook
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Interfaces (ensure these match your backend DTOs) ---

interface BackendProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  isVeg: boolean;
  category: string;
  rating: number;
  preparationTime: string;
  shopId: number; // Crucial for single-shop cart and checkout
}

interface Shop {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  // Add other shop details you might need for display (e.g., specific pickup instructions)
}

// Interface for items displayed on checkout page (combines product and quantity)
interface CheckoutItem extends BackendProduct {
  quantity: number;
}

// Define the structure of your User object from context
interface User {
  id: string | null;
  name: string | null;
  mobileNumber: string | null;
  email?: string | null; // Email can now be null from context initially
}

const CheckoutPage = () => {
  const { cart, currentShopId, currentShopName, clearCart } = useCart();
  const { user } = useUser(); // Access user data from context

  // Removed `email` state, it will now be taken directly from `user.email`
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [shopDetails, setShopDetails] = useState<Shop | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("pickup"); // Default to 'Pay at Pickup'
  const navigate = useNavigate();
  const { toast } = useToast();

  // Removed useEffect for populating email from user context

  // --- Fetch Cart Items and Shop Details ---
  useEffect(() => {
    const fetchCheckoutData = async () => {
      setDataLoading(true);
      setError(null);

      const productIds = Object.keys(cart).map(Number);

      if (productIds.length === 0) {
        setCheckoutItems([]);
        setShopDetails(null);
        setDataLoading(false);
        return;
      }

      try {
        const fetchedItems: CheckoutItem[] = [];
        let fetchedShop: Shop | null = null;

        // Fetch shop details
        if (currentShopId) {
          const shopResponse = await axios.get<Shop>(`http://localhost:8081/api/shops/${currentShopId}`);
          fetchedShop = shopResponse.data;
          setShopDetails(fetchedShop);
        }

        // Fetch details for each product in cart concurrently
        const productPromises = productIds.map(productId =>
          axios.get<BackendProduct>(`http://localhost:8081/api/products/${productId}`)
        );
        const productResponses = await Promise.all(productPromises);

        productResponses.forEach((response) => {
          const product = response.data;
          if (product.shopId !== currentShopId) {
            console.warn(`Product ${product.id} has shopId ${product.shopId} but expected ${currentShopId}. Skipping.`);
            return; // Skip this product if it doesn't belong to the current shop
          }
          fetchedItems.push({
            ...product,
            quantity: cart[product.id],
          });
        });
        
        setCheckoutItems(fetchedItems);
      } catch (err: any) {
        console.error("Error fetching checkout data:", err);
        setError('Failed to load checkout details. Please check your network and try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchCheckoutData();
  }, [cart, currentShopId, currentShopName]); // Dependencies ensure re-fetch if cart/shop changes

  // --- Calculations ---
  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + taxes;

  const estimatedPickupTime = new Date();
  estimatedPickupTime.setMinutes(estimatedPickupTime.getMinutes() + 25);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure user data is available, including email
    if (!user || !user.id || !user.name || !user.mobileNumber || !user.email) {
      toast({
        title: "Missing User Information",
        description: "Please ensure you are logged in and your profile (name, mobile, email) is complete before placing an order.",
        variant: "destructive",
      });
      navigate("/login/user"); // Redirect to login if user data is missing
      return;
    }

    if (checkoutItems.length === 0 || !currentShopId) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty or shop details are missing. Please add items to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare order payload for your backend
      const orderPayload = {
        userId: user.id, // User ID from context
        customerName: user.name, // User name from context
        customerPhone: user.mobileNumber, // User phone from context
        customerEmail: user.email, // <--- Directly using email from UserContext
        shopId: currentShopId,
        items: checkoutItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          priceAtOrder: item.price
        })),
        totalAmount: total,
        status: "PLACED", // Initial status for new order
        orderDate: new Date().toISOString(), // Current time in ISO format
        estimatedPickupTime: estimatedPickupTime.toISOString(), // Estimated pickup time in ISO format
        paymentMethod: paymentMethod // Include payment method
      };

      const response = await axios.post("http://localhost:8081/api/orders", orderPayload);
      
      // IMPORTANT: Use the actual orderId returned by the backend
      const orderId = response.data.orderId || response.data.id; 

      if (response.data.message) {
        toast({
          title: "Order Placed Successfully!",
          description: response.data.message, // Use message from backend
          variant: "success",
        });
      } else {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order ${orderId} has been confirmed. A confirmation email has been sent to ${user.email}.`, // Use user.email directly
          variant: "success",
        });
      }

      clearCart(); // Clear the cart after successful order
      navigate(`/order-tracking/${orderId}`); // Navigate to tracking page with the actual order ID

    } catch (err: any) {
      console.error("Error placing order:", err);
      let errorMessage = "Failed to place order. Please try again.";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = `Error: ${err.response.data?.message || err.response.statusText || 'Server error.'}`;
      }
      toast({
        title: "Order Placement Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading cart and shop details...
      </div>
    );
  }

  // Render error state if data fetching failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-700 font-semibold">
        Error: {error}
      </div>
    );
  }

  // Render empty cart state
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link to="/cart">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Checkout</h1>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            No items to checkout. Please add items to your cart from a stall.
          </p>
          <Link to="/user/browse/stalls"> {/* Direct to browse stalls page */}
            <Button>Browse Food Stalls</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-xl font-semibold ml-4">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information (now simpler as email is from context) */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h2>
                {/* Display user's email if available, no input field needed */}
                <div className="space-y-2">
                    <Label htmlFor="customerEmailDisplay">Email Address</Label>
                    <p id="customerEmailDisplay" className="text-md font-medium text-gray-800">
                        {user.email || "N/A (Please complete your profile)"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Order updates and pickup notifications will be sent to this email.
                    </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Pay at Pickup</p>
                          <p className="text-sm text-gray-500">Pay when you collect your order</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Pay Online</p>
                          <p className="text-sm text-gray-500">Pay now with credit/debit card</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Pickup Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Details
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-medium text-orange-900 mb-2">Pickup Location</h3>
                    <p className="text-orange-700">{shopDetails?.name || currentShopName}</p>
                    <p className="text-sm text-orange-600">{shopDetails?.address || "Loading address..."}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Pickup Time
                    </h3>
                    <p className="text-green-700 font-medium">
                      {estimatedPickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-green-600">
                      Please arrive within 10 minutes of this time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Review</h2>
                <div className="space-y-3">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant={item.isVeg ? "secondary" : "destructive"} className="text-xs">
                            {item.isVeg ? "Veg" : "Non-Veg"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{shopDetails?.name || currentShopName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price} x {item.quantity}</p>
                        <p className="text-sm text-gray-600">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">FREE (Pickup)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>₹{taxes.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || checkoutItems.length === 0}
                >
                  {isLoading ? "Placing Order..." : "Place Order"}
                </Button>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Pickup Service Only</p>
                  <p className="text-xs text-blue-600 mt-1">
                    No delivery charges. Pick up your fresh order from the stall.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
