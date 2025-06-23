import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon, History, Heart, MapPin, CreditCard, Settings, Search, Bell, HelpCircle, Star, Clock, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext"; // Import useUser hook
import axios from "axios"; // Import axios for API calls

// --- Interfaces (match your backend DTOs/Entities and UserContext) ---

interface OrderItemDocument {
  productId: string; // Assuming product ID is string from backend
  productName: string;
  priceAtOrder: number;
  quantity: number;
  imageUrl: string;
  isVeg: boolean;
}

interface OrderDocument {
  id: string; // MongoDB _id
  orderId: string; // Your custom UUID
  customerEmail: string;
  userId: number; // Assuming userId is a number (Long) from backend
  shopId: number;
  shopName: string;
  shopAddress: string;
  vendorId: number;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  orderDate: string; // ISO 8601 string from Instant
  estimatedPickupTime: string; // ISO 8601 string from Instant
  items: OrderItemDocument[];
}

// Ensure this User interface matches the one in UserContext.tsx
interface User {
  id: number; // User ID is a number (Long) from backend, ensure consistency
  name: string;
  mobileNumber: string;
  email?: string; // Make sure this property exists if you use it from context
}

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  // Destructure user, logout, isAuthenticated, and the new isLoading from useUser hook
  const { user, logout, isAuthenticated, isLoading } = useUser();
  const [userOrders, setUserOrders] = useState<OrderDocument[]>([]); // State for dynamic orders
  const [orderLoading, setOrderLoading] = useState(true); // Loading state for orders
  const [orderError, setOrderError] = useState<string | null>(null); // Error state for orders
  const navigate = useNavigate(); // For redirection

  // --- Authentication and Redirection Logic ---
  // This useEffect will run when isLoading or isAuthenticated changes.
  // It ensures redirection ONLY happens after the context has finished loading (isLoading is false).
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If loading is complete AND user is not authenticated, navigate to login
      navigate("/login/user");
    }
  }, [isLoading, isAuthenticated, navigate]); // Depend on these states and navigate

  // --- Fetch User-Specific Order History ---
  useEffect(() => {
    const fetchUserOrders = async () => {
      // Only attempt to fetch orders if loading is complete AND the user is authenticated
      if (!isLoading && isAuthenticated && user) { // Also check 'user' to ensure it's not null before accessing user.id
        setOrderLoading(true); // Start loading orders
        setOrderError(null); // Clear previous errors
        try {
          // Convert user.id from number to string if your backend expects a Long (though defined as number here)
          // Make sure your User interface's `id` type matches what `user.id` actually holds.
          // If user.id is string from backend but you store as number, convert.
          // Based on your User interface `id: number`, this should be fine.
          const userId = user.id; // Assuming user.id is already a number

          // Make the API call to fetch orders for the specific user
          const response = await axios.get<OrderDocument[]>(`http://localhost:8081/api/orders/user/${userId}`);
          setUserOrders(response.data); // Update the orders state
        } catch (err: any) {
          console.error("Error fetching user orders:", err);
          setOrderError("Failed to load your order history. Please try again.");
        } finally {
          setOrderLoading(false); // End loading, regardless of success or failure
        }
      } else if (!isLoading && !isAuthenticated) {
        // If loading is done and user is not authenticated, don't try to fetch orders.
        // Set orderLoading to false to avoid perpetual loading spinner if the user is logged out.
        setOrderLoading(false);
      }
    };

    fetchUserOrders();
  }, [user, isLoading, isAuthenticated]); // Re-run if user, isLoading, or isAuthenticated changes

  // Helper function to determine badge color based on order status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) { // Ensure case-insensitive comparison
      case "completed":
      case "delivered": return "default"; // Assuming 'delivered' maps to 'completed' status
      case "preparing":
      case "placed":
      case "ready_for_pickup": return "secondary"; // Adjusted for backend statuses
      case "cancelled":
      case "rejected": return "destructive"; // Adjusted for backend statuses
      default: return "secondary";
    }
  };

  // Helper to get initials for avatar from user's name
  const getUserInitials = (name: string | null) => {
    if (!name || name.trim() === "") return "U"; // Default to 'U' for unknown user
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // --- Conditional Render: Loading State ---
  // Display a loading message while the UserContext is determining authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading user data...
      </div>
    );
  }

  // --- Conditional Render: Not Authenticated (handled by useEffect, but a safeguard) ---
  // If isLoading is false but isAuthenticated is also false, the useEffect above
  // should have already redirected. This is a fallback/visual confirmation.
  if (!isAuthenticated) {
    return null; // Or a simple message like "Redirecting..." if you want.
  }

  // --- Main Dashboard Content (only renders if authenticated and loaded) ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              
              <h1 className="text-xl font-semibold">My Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/user/browse/stalls">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Search className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={logout}>
                Log Out
              </Button>
              <Avatar>
                <AvatarFallback>
                  {getUserInitials(user.name)} {/* Use dynamic user name for initials */}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name || "User"}!</h2>
                  <p className="opacity-90">Member since January 2024</p> {/* This date is still static */}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{userOrders.length}</div> {/* Dynamic total orders */}
                  <p className="text-sm opacity-90">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userOrders.length}</div> {/* Dynamic total orders */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Stalls</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* This is still mock data; requires backend for dynamic favorites */}
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* This is still mock data; requires backend filtering */}
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Orders placed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Orders (Now uses dynamic data) */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orderLoading ? (
                  <div className="text-center text-gray-600">Loading recent orders...</div>
                ) : orderError ? (
                  <div className="text-center text-red-600">{orderError}</div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center text-gray-600">No recent orders found.</div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.slice(0, 3).map((order) => ( // Display top 3 recent orders
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{order.shopName}</h4>
                          <p className="text-sm text-gray-600">
                            {order.items.map(item => `${item.productName} x${item.quantity}`).join(", ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={getStatusColor(order.status)} className="capitalize">
                            {order.status.replace(/_/g, ' ')} {/* Format status for display */}
                          </Badge>
                          <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
                          <Link to={`/order-tracking/${order.orderId}`}> {/* Use orderId for tracking */}
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("orders")}>
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions (Remains the same) */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/"> {/* Link to main browse stalls page */}
                    <Button variant="outline" className="w-full flex flex-col h-20">
                      <MapPin className="h-6 w-6 mb-2" />
                      <span className="text-sm">Browse Stalls</span>
                    </Button>
                  </Link>
                  <Link to="/cart">
                    <Button variant="outline" className="w-full flex flex-col h-20">
                      <Package className="h-6 w-6 mb-2" />
                      <span className="text-sm">View Cart</span>
                    </Button>
                  </Link>
                  <Link to="/chat-support"> {/* Placeholder for chat support */}
                    <Button variant="outline" className="w-full flex flex-col h-20">
                      <HelpCircle className="h-6 w-6 mb-2" />
                      <span className="text-sm">Get Help</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full flex flex-col h-20" onClick={() => setActiveTab("favorites")}>
                    <Heart className="h-6 w-6 mb-2" />
                    <span className="text-sm">Favorites</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Full Order History (Now uses dynamic data) */}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orderLoading ? (
                  <div className="text-center text-gray-600">Loading full order history...</div>
                ) : orderError ? (
                  <div className="text-center text-red-600">{orderError}</div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center text-gray-600">You haven't placed any orders yet.</div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{order.shopName}</h4>
                            <Badge variant={getStatusColor(order.status)} className="capitalize">
                              {order.status.replace(/_/g, ' ')} {/* Format status for display */}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.items.map(item => `${item.productName} x${item.quantity}`).join(", ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
                          <Link to={`/order-tracking/${order.orderId}`}> {/* Use orderId for tracking */}
                            <Button size="sm" variant="outline">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {/* Favorite Stalls (Still uses mock data) */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Stalls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="text-center text-gray-600 p-4">
                    Your favorite stalls will appear here! (Currently using mock data)
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-gray-600">{user.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{user.email || "N/A"}</p> {/* Use dynamic user.email */}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-gray-600">{user.mobileNumber ? `+91 ${user.mobileNumber}` : "N/A"}</p>
                  </div>
                </div>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile {/* This button will need implementation for editing profile */}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* These are static preferences for now */}
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Order Updates</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;