import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import StallHeader from "@/components/stall/StallHeader"; // Correct import path
import StallHero from "@/components/stall/StallHero";
import MenuSection from "@/components/stall/MenuSection";
import { useCart } from '@/context/CartContext';

// Import UI components for dialog (assuming you have them, e.g., Shadcn UI)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// --- Define Interfaces for your data structure ---
interface Shop {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  cuisine: string;
  isActive: true;
  imageUrl: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  speciality: string;
  isVeg: boolean;
  featured: boolean;
}

// NOTE: Product must now include shopId for cart logic
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  isVeg: boolean;
  category: string;
  rating: number;
  preparationTime: string;
  shopId: number; // <--- IMPORTANT: Ensure your backend Product model/DTO returns this!
}

interface MenuItem extends Product {
  image: string; // MenuItem uses 'image' while Product uses 'imageUrl'
}

// Assuming StallHeroDisplayData is defined elsewhere or directly mapped from Shop
interface StallHeroDisplayData {
  name: string;
  image: string;
  rating: number;
  time: string;
  distance: string;
  cuisine: string;
  speciality: string;
  isVeg: boolean;
}
// --- End of Interfaces ---


const StallPage = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const { cart, currentShopId, currentShopName, addToCart, removeFromCart, clearCartAndAddProduct, getCartItemQuantity, totalItemsInCart } = useCart();

  const [stall, setStall] = useState<StallHeroDisplayData | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for shop mismatch dialog
  const [showMismatchDialog, setShowMismatchDialog] = useState(false);
  const [productToClearAndAdd, setProductToClearAndAdd] = useState<MenuItem | null>(null);

  useEffect(() => {
    const fetchStallData = async () => {
      if (!stallId) {
        setError("Stall ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const stallResponse = await axios.get<Shop>(`http://localhost:8081/api/shops/${stallId}`);
        const fetchedStall = stallResponse.data;

        const mappedStallForHero: StallHeroDisplayData = {
          name: fetchedStall.name,
          image: fetchedStall.imageUrl,
          rating: fetchedStall.rating,
          time: fetchedStall.deliveryTime,
          distance: fetchedStall.distance,
          cuisine: fetchedStall.cuisine,
          speciality: fetchedStall.speciality,
          isVeg: fetchedStall.isVeg,
        };
        setStall(mappedStallForHero);

        const itemsResponse = await axios.get<Product[]>(`http://localhost:8081/api/products/shop/${stallId}`);

        if (Array.isArray(itemsResponse.data)) {
          const fetchedProducts: Product[] = itemsResponse.data;
          const mappedItems: MenuItem[] = fetchedProducts.map(item => ({
            ...item,
            image: item.imageUrl
            // The `shopId` for Product is crucial for cart logic.
            // If your backend doesn't return `shopId` directly in the Product DTO,
            // you'll need to explicitly add it here from the `stallId` or ensure
            // your backend product DTO for `/api/products/shop/{stallId}` includes it.
            // For now, assuming `item.shopId` exists from backend response.
          }));
          setItems(mappedItems);
        } else {
          console.error("API did not return an array for products:", itemsResponse.data);
          setItems([]);
        }

      } catch (err: any) {
        console.error("Error fetching stall data:", err);
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 404) {
              setError("Stall not found.");
            } else {
              setError(`Failed to load stall details: ${err.response.statusText || err.message}`);
            }
        } else {
            setError("An unexpected error occurred while loading stall details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStallData();
  }, [stallId]);

  const handleAddToCart = (item: MenuItem) => {
    // Pass the full product object to addToCart in context
    // IMPORTANT: Ensure `item.shopId` is correctly populated here.
    // If not, you might need to add `shopId: parseInt(stallId as string)`
    // to the item before passing it to `addToCart`.
    const productWithShopId: Product = { ...item, shopId: parseInt(stallId as string) };
    const result = addToCart(productWithShopId);
    if (result === 'mismatch') {
      setProductToClearAndAdd(productWithShopId); // Pass product with shopId
      setShowMismatchDialog(true);
    }
  };

  const handleRemoveFromCart = (itemId: number) => {
    removeFromCart(itemId);
  };

  const handleClearCartAndAdd = () => {
    if (productToClearAndAdd) {
      clearCartAndAddProduct(productToClearAndAdd);
      setProductToClearAndAdd(null);
      setShowMismatchDialog(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">Loading stall details...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-700 font-semibold">Error: {error}</div>;
  }

  if (!stall) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">Stall not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StallHeader stallName={stall.name} totalItems={totalItemsInCart} />
      <StallHero stall={stall} />
      <MenuSection
        items={items}
        filter={filter}
        onFilterChange={setFilter}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        getCartItemQuantity={getCartItemQuantity}
      />

      {/* Shop Mismatch Alert Dialog */}
      <AlertDialog open={showMismatchDialog} onOpenChange={setShowMismatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Items from another shop detected!</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart currently contains items from **{currentShopName || 'another shop'}**.
              To add items from **{stall.name}**, you need to clear your current cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCartAndAdd}>
              Clear Cart & Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StallPage;