// src/pages/CartPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from '@/context/CartContext';
import axios from "axios";

// Define the structure of a product as it appears in the cart for display
interface DisplayCartItem {
  id: number;
  name: string;
  price: number;
  image: string; // Mapped from imageUrl
  shopId: number; // Now comes from the fetched product
  shopName: string; // This should come from the fetched product/shop details
  quantity: number;
  isVeg: boolean;
}

// Define the Product interface as it comes from the backend
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
  shopId: number; // MUST be available from backend
}

// Define the Shop interface as it comes from the backend (to fetch shop name)
interface Shop {
  id: number;
  name: string; // We need this
  address: string;
  // ... other shop properties
}


const CartPage = () => {
  const { cart, currentShopId, currentShopName, addToCart, removeFromCart, clearCart, totalItemsInCart } = useCart();
  const [cartItems, setCartItems] = useState<DisplayCartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartItemDetails = async () => {
      setLoading(true);
      setError(null);
      const productIds = Object.keys(cart).map(Number);

      if (productIds.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const fetchedDetails: DisplayCartItem[] = [];
        let fetchedShopName: string | null = null; // Store shop name once

        if (currentShopId && !currentShopName) {
            // If currentShopName isn't set in context, try to fetch it once
            try {
                const shopResponse = await axios.get<Shop>(`http://localhost:8081/api/shops/${currentShopId}`);
                fetchedShopName = shopResponse.data.name;
            } catch (shopErr) {
                console.error("Error fetching shop name for cart:", shopErr);
                fetchedShopName = "Unknown Shop";
            }
        } else {
            fetchedShopName = currentShopName; // Use the name from context if already set
        }


        for (const productId of productIds) {
          const productResponse = await axios.get<BackendProduct>(`http://localhost:8081/api/products/${productId}`);
          const product = productResponse.data;

          if (product.shopId !== currentShopId) {
              // This should ideally not happen if single-shop logic is working correctly in addToCart
              // but it's a good defensive check.
              console.warn(`Product ${productId} in cart belongs to a different shop than currentShopId.`);
              continue;
          }

          fetchedDetails.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl,
            shopId: product.shopId,
            shopName: fetchedShopName || "Loading Shop...", // Use fetched name or placeholder
            quantity: cart[productId],
            isVeg: product.isVeg,
          });
        }
        setCartItems(fetchedDetails);
      } catch (err: any) {
        console.error("Error fetching cart item details:", err);
        setError("Failed to load cart item details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItemDetails();
  }, [cart, currentShopId, currentShopName]); // Depend on cart, currentShopId, currentShopName

  const updateQuantity = (itemId: number, newQuantity: number) => {
    // These functions now directly use the context functions
    if (newQuantity === 0) {
      removeFromCart(itemId, cart[itemId]); // Remove all of this item
    } else if (newQuantity > (cart[itemId] || 0)) {
      // Need to find the product first to pass to addToCart, but context can handle it with just ID if product info is already associated.
      // For simplicity, `addToCart` and `removeFromCart` in context only take ID.
      // If you stored ProductInCart objects in the cart context, you'd pass the product.
      // Since context `addToCart` takes `ProductInCart`, we need the full item for `addToCart` on CartPage
      // This is a common pattern for CartPage: it updates quantities directly by ID.
      // We are *not* adding a new item from a different shop here, just changing quantity.
      // So, direct +/- calls to context functions are fine.
      addToCart(cartItems.find(item => item.id === itemId)!, newQuantity - (cart[itemId] || 0)); // Pass the full product
    } else {
      removeFromCart(itemId, (cart[itemId] || 0) - newQuantity);
    }
  };

  const removeItem = (itemId: number) => {
    removeFromCart(itemId, cart[itemId]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 0; // Pickup service
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + deliveryFee + taxes;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-700 font-semibold">
        Error: {error}
      </div>
    );
  }

  if (totalItemsInCart === 0) { // Use totalItemsInCart from context
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Stalls
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items from our food stalls!</p>
          <Link to="/">
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="user/browse/stalls">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Your Cart {currentShopName && `(${currentShopName})`}</h1>
            </div>
            <span className="text-sm text-gray-600">
              {totalItemsInCart} {totalItemsInCart === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.shopName}</p> {/* Use shopName */}
                        <p className="text-lg font-semibold text-orange-600">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">FREE (Pickup)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>₹{taxes}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <Link to="/checkout" className="w-full mt-6 block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  You'll be able to review your order before placing it
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;