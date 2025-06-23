import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodItem from "./FoodItem"; // Ensure this import path is correct

// Matches your ProductDTO (MenuItem interface with dietary flags)
interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string; // Changed from 'image' to 'imageUrl' to match backend DTO
  description: string;
  isVeg: boolean;
  category: string;
  rating: number;
  preparationTime: string;
  isKetoFriendly: boolean; // Dietary flag
  isLowCarb: boolean;      // Dietary flag
  isHighProtein: boolean;  // Dietary flag
  shopId: number;
}

interface MenuSectionProps {
  items: MenuItem[];
  filter: string;
  onFilterChange: (filter: string) => void;
  cart: Record<number, number>;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: number) => void;
}

const MenuSection = ({
  items,
  filter,
  onFilterChange,
  cart,
  onAddToCart,
  onRemoveFromCart,
}: MenuSectionProps) => {
  const filteredItems = items.filter((item) => {
    if (filter === "veg") return item.isVeg;
    if (filter === "non-veg") return !item.isVeg;
    return true; // "all" filter
  });

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Menu</h3>
          <Tabs value={filter} onValueChange={onFilterChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="veg">Veg Only</TabsTrigger>
              <TabsTrigger value="non-veg">Non-Veg</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <FoodItem
              key={item.id}
              item={item}
              cartQuantity={cart[item.id] || 0}
              onAddToCart={() => onAddToCart(item)}
              onRemoveFromCart={() => onRemoveFromCart(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
