import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Plus,
    Bell,
    Package,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Eye,
    UtensilsCrossed, // For non-veg icon alternative
    Leaf, // For veg icon alternative
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import AddItemModal from "@/components/vendor/AddItemModal";
import EditItemModal from "@/components/vendor/EditItemModal"; // Import EditItemModal
import OrderQueue from "@/components/vendor/OrderQueue";
import VendorStats from "@/components/vendor/VendorStats";
import QRCodeScanner from "@/components/vendor/QRCodeScanner";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';
import axiosInstance from "@/api/axiosInstance";
import { useAuth, User } from '@/context/AuthContext';

// Interface for MenuItem (Product from backend)
// ENSURE THIS MATCHES YOUR BACKEND PRODUCT DTO
interface MenuItem {
    id: number; // Product ID (Long) from backend
    name: string;
    price: number;
    imageUrl: string; // Note: AddItemModal uses imageUrl, EditItemModal uses 'image' in its internal state, we map here
    description: string;
    isVeg: boolean;
    category: string;
    isAvailable: boolean; // Field to control availability
    preparationTime: string;
    shopId: number; // Crucial for backend association
    // New dietary flags and rating, must match backend Product structure
    isKetoFriendly: boolean;
    isHighProtein: boolean;
    isLowCarb: boolean;
    rating: number; // Assuming your backend Product model includes a rating
}

// Interface for Shop (ShopDto from backend)
interface Shop {
    id: number;
    name: string;
    address: string;
    contactNumber: string;
    cuisine: string;
    isActive: boolean; // This is the crucial field from ShopDto
    imageUrl: string;
    rating: number;
    deliveryTime: string;
    distance: string;
    speciality: string;
    isVeg: boolean;
    featured: boolean;
    vendorId: number;
}

interface Notification {
    id: number;
    message: string;
    time: string;
    isRead: boolean;
}

// ====================================================================
// VendorDashboard Component
// ====================================================================

const VendorDashboard = () => {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [isStoreOnline, setIsStoreOnline] = useState(false);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    // State for EditItemModal
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState<string | null>(null);
    const [shopStatusLoading, setShopStatusLoading] = useState(true); // New loading state for shop status
    const [shopStatusError, setShopStatusError] = useState<string | null>(null); // New error state for shop status

    const [stompClient, setStompClient] = useState<Client | null>(null);
    const navigate = useNavigate();

    // Effect to handle initial authentication check and redirect
    useEffect(() => {
        const checkAuthAndFetchShopStatus = async () => {
            if (!authLoading) {
                if (!isAuthenticated || !user || user.role !== 'Vendor') {
                    toast({ title: "Authentication Required", description: "Please log in as a vendor to access the dashboard.", variant: "destructive" });
                    navigate("/login/vendor");
                    setShopStatusLoading(false);
                    return;
                }

                const currentShopId = user.shopId ?? user.id; // Assuming user.shopId is available from backend on login

                if (!currentShopId) {
                    setShopStatusError("Your vendor account is not associated with a shop.");
                    setShopStatusLoading(false);
                    return;
                }

                // Fetch the store's current online status from the backend
                try {
                    const response = await axiosInstance.get<Shop>(`/shops/${currentShopId}`);
                    setIsStoreOnline(response.data.isActive);
                    setShopStatusLoading(false);
                } catch (error: any) {
                    console.error("Error fetching shop status:", error);
                    setShopStatusError(error.response?.data?.message || "Failed to load store status. Please refresh.");
                    setShopStatusLoading(false);
                }
            }
        };

        checkAuthAndFetchShopStatus();
    }, [isAuthenticated, user, authLoading, navigate]);

    // Effect to fetch menu items when user (from AuthContext) is available
    useEffect(() => {
        const fetchMenuItems = async () => {
            const currentShopId = user?.shopId ?? user?.id;

            if (!currentShopId) {
                setMenuLoading(false);
                console.log("Shop ID not available for menu item fetch. User:", user);
                setMenuError("Could not determine shop ID to load menu items.");
                return;
            }

            setMenuLoading(true);
            setMenuError(null);
            try {
                const response = await axiosInstance.get<MenuItem[]>(`/vendors/${currentShopId}/products`);
                setItems(response.data);
            } catch (err: any) {
                console.error("Error fetching menu items:", err);
                setMenuError(err.response?.data?.message || "Failed to load menu items. Please try again.");
                setItems([]);
            } finally {
                setMenuLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'Vendor') {
            fetchMenuItems();
        } else {
            setMenuLoading(false);
            setItems([]);
        }
    }, [isAuthenticated, user?.shopId, user?.id, user?.role]);

    // Effect to manage WebSocket connection lifecycle
    useEffect(() => {
        if (!isAuthenticated || !user || user.role !== 'Vendor' || !user.username || !user.id) {
            console.log("User not authenticated, not a vendor, or missing details for WebSocket. Skipping connection.");
            if (stompClient && stompClient.connected) {
                stompClient.deactivate();
                setStompClient(null);
            }
            return;
        }

        if (stompClient && stompClient.connected) {
            console.log("STOMP client already connected and active for current user. Skipping new connection.");
            return;
        }

        console.log(`Attempting WebSocket connection for vendor: ${user.username} (ID: ${user.id})`);

        const client = new Client({
            brokerURL: "ws://localhost:8081/ws",
            webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
            // debug: function (str) { console.log("STOMP DEBUG:", str); },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("Connected to WebSocket for vendor:", user.username);
            setStompClient(client);

            client.subscribe(`/topic/notifications/${user.username}`, (message) => {
                const newNotification = JSON.parse(message.body);
                console.log("New notification received via WebSocket:", newNotification);
                toast({ title: "New Notification!", description: newNotification.message, variant: "default" });
                setNotifications((prev) => [
                    { id: Date.now(), message: newNotification.message, time: "Just now", isRead: false },
                    ...prev,
                ]);
            });
            setNotifications([
                { id: 1, message: "New order received - #ORD001", time: "2 min ago", isRead: false },
                { id: 2, message: "Order #ORD002 completed", time: "15 min ago", isRead: true },
                { id: 3, message: "Low stock alert for Chicken Biryani", time: "1 hour ago", isRead: false },
            ]);
        };

        client.onStompError = (frame) => {
            console.error("Broker reported STOMP error:", frame.headers["message"]);
            console.error("Additional STOMP details:", frame.body);
            toast({ title: "WebSocket Error", description: "Could not connect to real-time updates. Please refresh.", variant: "destructive" });
            setStompClient(null);
        };

        client.onWebSocketClose = (event) => {
            console.log("WebSocket closed:", event);
            setStompClient(null);
            toast({ title: "WebSocket Disconnected", description: "Real-time updates interrupted. Attempting to reconnect...", variant: "destructive" });
        };

        client.onWebSocketError = (event) => {
            console.error("WebSocket error:", event);
            setStompClient(null);
            toast({ title: "WebSocket Error", description: "Real-time connection error. Please check network.", variant: "destructive" });
        };

        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
                console.log("Deactivating STOMP client for vendor:", user.username);
            }
            setStompClient(null);
        };
    }, [isAuthenticated, user?.username, user?.id, user?.role]);

    // Function to toggle store online/offline status
    const toggleStoreStatus = async () => {
        if (!user || !user.shopId) {
            toast({ title: "Error", description: "Shop information not available. Cannot change status.", variant: "destructive" });
            return;
        }

        try {
            // Assuming your backend has an endpoint like PATCH /api/shops/{id}/toggle-active
            const response = await axiosInstance.patch<Shop>(`/shops/${user.shopId}/toggle-active`);
            const newStatus = response.data.isActive;
            setIsStoreOnline(newStatus);
            toast({
                title: newStatus ? "Store Opened" : "Store Closed",
                description: newStatus
                    ? "Your store is now online and ready to receive orders."
                    : "Your store is now offline and won't receive new orders.",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Error toggling store status:", error);
            toast({
                title: "Failed to Update Store Status",
                description: error.response?.data?.message || "An error occurred while updating store status.",
                variant: "destructive",
            });
        }
    };

    const toggleItemAvailability = async (itemId: number, currentAvailability: boolean) => {
        if (!user || user.role !== 'Vendor' || !user.id) {
            toast({ title: "Error", description: "Authentication error: User is not a valid vendor.", variant: "destructive" });
            return;
        }
        try {
            await axiosInstance.patch(`/products/${itemId}/toggle-availability`, { isAvailable: !currentAvailability });
            setItems((prev) =>
                prev.map((item) =>
                    item.id === itemId ? { ...item, isAvailable: !currentAvailability } : item
                )
            );
            toast({
                title: "Item Updated",
                description: `Item availability changed to ${!currentAvailability ? "Available" : "Unavailable"}.`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Error toggling item availability:", error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update item availability.",
                variant: "destructive",
            });
        }
    };

    const handleAddItem = async (newItemData: Omit<MenuItem, 'id' | 'isAvailable' | 'shopId' | 'imageUrl'> & { imageUrl: string }) => {
        const currentShopId = user?.shopId ?? user?.id;

        if (!currentShopId) {
            toast({ title: "Error", description: "Shop ID not found for adding item. Please ensure vendor is associated with a shop.", variant: "destructive" });
            return;
        }
        try {
            const itemToCreate = {
                ...newItemData,
                shopId: currentShopId,
                isAvailable: true, // New items are available by default
            };
            const response = await axiosInstance.post<MenuItem>("/products", itemToCreate);
            setItems((prev) => [...prev, response.data]);
            setIsAddItemModalOpen(false);
            toast({
                title: "Item Added",
                description: `${response.data.name} has been added to your menu.`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Error adding item:", error);
            toast({
                title: "Add Item Failed",
                description: error.response?.data?.message || "Failed to add new item.",
                variant: "destructive",
            });
        }
    };

    // Function to open the Edit Item Modal
    const handleEditItem = (item: MenuItem) => {
        setItemToEdit(item);
        setIsEditItemModalOpen(true);
    };

    // Function to handle item update from EditItemModal
    const handleUpdateItem = async (
        itemId: number,
        updatedData: Omit<MenuItem, 'id' | 'isAvailable'>, // Use MenuItem, omit ID and isAvailable
        imageFile?: File | null
    ) => {
        if (!user || user.role !== 'Vendor' || !user.id) {
            toast({ title: "Error", description: "Authentication error: User is not a valid vendor.", variant: "destructive" });
            return;
        }

        try {
            let imageUrlToSend = updatedData.imageUrl; // Start with the URL from formData

            // If a new image file is provided, handle its upload first
            if (imageFile) {
                // --- IMPORTANT: IMAGE UPLOAD LOGIC ---
                // This part needs a backend endpoint that accepts a file upload
                // and returns the URL of the uploaded image.
                // Example:
                // const formData = new FormData();
                // formData.append('file', imageFile);
                // const uploadResponse = await axiosInstance.post('/upload/image', formData, {
                //   headers: { 'Content-Type': 'multipart/form-data' },
                // });
                // imageUrlToSend = uploadResponse.data.url;
                // --- END IMPORTANT ---
                toast({
                    title: "Image Upload",
                    description: "Image upload logic is a placeholder. Implement backend endpoint for file uploads.",
                    variant: "default",
                });
                console.warn("Image file selected for update, but direct file upload to backend via this flow is not implemented. Only URL is sent.");
                // For now, if a file is selected but no backend upload, you might want to prevent update
                // or ensure the existing imageUrl is used if no new URL is determined from upload.
                // For this example, we'll proceed with the existing imageUrl or what was in the form.
            }

            // Prepare data for the PUT request
            // Ensure the 'image' property from the modal is mapped to 'imageUrl' for the backend
            const itemToUpdate = {
                ...updatedData,
                imageUrl: imageUrlToSend, // Use the new URL if uploaded, otherwise existing
                // isAvailable is updated via a separate endpoint (toggleItemAvailability)
                // so we don't send it in this general update.
            };

            // Assuming your backend has a PUT endpoint like /api/products/{productId}
            const response = await axiosInstance.put<MenuItem>(`/products/${itemId}`, itemToUpdate);

            setItems((prev) =>
                prev.map((item) =>
                    item.id === itemId ? { ...item, ...response.data } : item
                )
            );
            setIsEditItemModalOpen(false);
            setItemToEdit(null); // Clear itemToEdit
            toast({
                title: "Item Updated",
                description: `${response.data.name} has been updated.`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Error updating item:", error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update item.",
                variant: "destructive",
            });
        }
    };

    const deleteItem = async (itemId: number) => {
        if (!user || user.role !== 'Vendor' || !user.id) {
            toast({ title: "Error", description: "Authentication error: User is not a valid vendor.", variant: "destructive" });
            return;
        }
        try {
            await axiosInstance.delete(`/products/${itemId}`);
            setItems((prev) => prev.filter((item) => item.id !== itemId));
            toast({
                title: "Item Deleted",
                description: "Item has been removed from your menu.",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Error deleting item:", error);
            toast({
                title: "Delete Failed",
                description: error.response?.data?.message || "Failed to delete item.",
                variant: "destructive",
            });
        }
    };

    const handleQRScanSuccess = (orderId: string) => {
        console.log("Scanned order ID:", orderId);
        toast({
            title: "Order Verified",
            description: `Order ${orderId} has been verified via QR code`,
        });
    };

    const unreadNotifications = notifications.filter((n) => !n.isRead).length;

    // Show loading state for both authentication and shop status fetch
    if (authLoading || shopStatusLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Show error if shop status fetch failed
    if (shopStatusError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
                Error: {shopStatusError}
            </div>
        );
    }

    // This check ensures user is authenticated and is a vendor before rendering dashboard content
    if (!isAuthenticated || !user || user.role !== 'Vendor') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
                Access Denied. Please log in as a vendor.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Vendor Dashboard for{" "}
                                <span className="text-orange-600">
                                    {user.username}
                                </span>{" "}
                            </h1>
                            <Badge variant={isStoreOnline ? "default" : "secondary"} className={isStoreOnline ? "bg-green-600" : ""}>
                                {isStoreOnline ? "Online" : "Offline"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant={isStoreOnline ? "destructive" : "default"}
                                onClick={toggleStoreStatus}
                            >
                                {isStoreOnline ? "Close Store" : "Open Store"}
                            </Button>

                            <div className="relative">
                                <Button variant="outline" size="sm">
                                    <Bell className="h-4 w-4" />
                                    {unreadNotifications > 0 && (
                                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                            {unreadNotifications}
                                        </Badge>
                                    )}
                                </Button>
                            </div>

                            <Button variant="outline" size="sm" onClick={logout}>
                                <Eye className="h-4 w-4 mr-2" />
                                Log out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {user && <VendorStats vendor={user} />}

                <Tabs defaultValue="orders" className="mt-8">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="orders">Order Queue</TabsTrigger>
                        <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
                        <TabsTrigger value="menu">Menu Management</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="mt-6">
                        {user?.username && user?.id ? (
                            <OrderQueue
                                stompClient={stompClient}
                                vendorUsername={user.username}
                                vendorId={user.id}
                                shopId={user.shopId}
                            />
                        ) : (
                            <p className="text-center text-gray-500">Loading order queue...</p>
                        )}
                    </TabsContent>

                    <TabsContent value="scanner" className="mt-6">
                        <div className="max-w-md mx-auto">
                            <QRCodeScanner onScanSuccess={handleQRScanSuccess} />
                        </div>
                    </TabsContent>

                    <TabsContent value="menu" className="mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Menu Items</h3>
                            <Button onClick={() => setIsAddItemModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Item
                            </Button>
                        </div>

                        {menuLoading ? (
                            <div className="text-center text-gray-600 py-10">Loading menu items...</div>
                        ) : menuError ? (
                            <div className="text-center text-red-600 py-10">{menuError}</div>
                        ) : items.length === 0 ? (
                            <div className="text-center text-gray-600 py-10">No menu items found. Add your first item!</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <Card key={item.id} className="overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => { e.currentTarget.src = "https://placehold.co/300x200/cccccc/333333?text=No+Image"; }}
                                            />
                                            {/* Veg/Non-Veg Badge with icons */}
                                            <Badge
                                                className={`absolute top-3 left-3 flex items-center gap-1 ${
                                                    item.isVeg ? "bg-green-600" : "bg-red-600"
                                                }`}
                                            >
                                                {item.isVeg ? <Leaf className="h-3 w-3" /> : <UtensilsCrossed className="h-3 w-3" />}
                                                {item.isVeg ? "Veg" : "Non-Veg"}
                                            </Badge>
                                            {/* Availability Badge */}
                                            <Badge
                                                className={`absolute top-3 right-3 ${
                                                    item.isAvailable ? "bg-green-600" : "bg-gray-500"
                                                }`}
                                            >
                                                {item.isAvailable ? "Available" : "Unavailable"}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h4 className="text-lg font-semibold mb-2">
                                                {item.name}
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {item.description}
                                            </p>
                                            {/* Dietary Flags Display */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {item.isKetoFriendly && <Badge variant="outline" className="border-purple-500 text-purple-700">Keto</Badge>}
                                                {item.isHighProtein && <Badge variant="outline" className="border-blue-500 text-blue-700">High Protein</Badge>}
                                                {item.isLowCarb && <Badge variant="outline" className="border-orange-500 text-orange-700">Low Carb</Badge>}
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xl font-bold text-orange-600">
                                                    ₹{item.price}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {item.preparationTime}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleItemAvailability(item.id, item.isAvailable)}
                                                    className="flex-1"
                                                >
                                                    {item.isAvailable ? (
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                    )}
                                                    {item.isAvailable ? "Disable" : "Enable"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditItem(item)} // Call handleEditItem
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => deleteItem(item.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daily Sales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        ₹2,450
                                    </div>
                                    <p className="text-gray-600">+12% from yesterday</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Orders Today</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">23</div>
                                    <p className="text-gray-600">+5 from yesterday</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Order Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600">
                                        ₹387
                                    </div>
                                    <p className="text-gray-600">-2% from yesterday</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Rating</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-600">
                                        4.5
                                    </div>
                                    <p className="text-gray-600">Based on 156 reviews</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Notifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 rounded-lg border ${
                                                notification.isRead
                                                    ? "bg-gray-50"
                                                    : "bg-blue-50 border-blue-200"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium">{notification.message}</p>
                                                <span className="text-sm text-gray-500">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onAddItem={handleAddItem}
            />

            {/* Render EditItemModal */}
            {itemToEdit && ( // Only render if an item is selected for editing
                <EditItemModal
                    isOpen={isEditItemModalOpen}
                    onClose={() => {
                        setIsEditItemModalOpen(false);
                        setItemToEdit(null); // Clear the item when modal closes
                    }}
                    itemData={itemToEdit}
                    onUpdateItem={handleUpdateItem}
                />
            )}
        </div>
    );
};

export default VendorDashboard;