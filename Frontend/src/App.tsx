import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// Import your page components
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StallPage from "./pages/StallPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import VendorDashboard from "./pages/VendorDashboard";
import VendorLoginPage from "./pages/VendorLoginPage";
import UserLoginPage from "./pages/UserLoginPage"; // Correct path to UserLoginPage
import UserDashboardPage from "./pages/UserDashboard"; // Correct path to UserDashboardPage
import NotFound from "./pages/NotFound";
import ChatSupportPage from "./pages/ChatSupportPage";
import SupportStaffLoginPage from "./pages/SupportStaffLoginPage";
import SupportDashboard from "./pages/SupportDashboard";
import DeliveryLoginPage from "./pages/DeliveryLoginPage";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import Index from "./pages/Index"; // Assuming this is your Browse Stalls page
import AdminIndex from "./pages/AdminIndex";
// Import Context Providers
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext'; // Correct path to UserContext
import ResetPassword from "./pages/ResetPassword";
const queryClient = new QueryClient();

// A Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useUser(); // Get isLoading from context

  if (isLoading) {
    // Show a loading indicator while authentication status is being determined
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated after loading
    return <Navigate to="/login/user" replace />;
  }
  return children;
};

// A component to decide where to go from root (/)
const HomeOrDashboard = () => {
  const { isAuthenticated, isLoading } = useUser(); // Get isLoading from context

  if (isLoading) {
    // Show a loading indicator while authentication status is being determined
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading...
      </div>
    );
  }

  // If authenticated (and not loading), go to dashboard.
  // Otherwise, go to the UserBrowseStallsPage (Index component).
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/user/browse/stalls" replace />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <AuthProvider>
        <UserProvider> {/* Wrap your entire application with UserProvider */}
          <CartProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/home" element={<AdminIndex />} />
              <Route path="/" element={<HomeOrDashboard />} /> {/* Decides between Dashboard and Browse Stalls */}
              <Route path="/login/user" element={<UserLoginPage />} />
              <Route path="/login/vendor" element={<VendorLoginPage />} />
              <Route path="/login/support" element={<SupportStaffLoginPage />} />
              <Route path="/login/delivery" element={<DeliveryLoginPage />} />
              <Route path="/login/admin" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* New route for Browse stalls */}
              <Route path="/user/browse/stalls" element={<Index />} />
              <Route
              path="/admin-dashboard/*"
              element={
                // <ProtectedRoute>
                  <AdminDashboard />
                // </ProtectedRoute>
              }
            />
              {/* Protected User Dashboard Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Other application routes that might need protection */}
              {/* You might want to wrap more routes with <ProtectedRoute> */}
              <Route path="/stall/:stallId" element={<StallPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />

              {/* Vendor, Support, Delivery dashboards (consider adding specific protected routes for these roles) */}
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/chat-support" element={<ChatSupportPage />} />
              <Route path="/support/dashboard" element={<SupportDashboard />} />
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;