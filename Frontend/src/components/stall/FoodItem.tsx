import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Plus, Minus, Star, Clock } from "lucide-react"; // Import Clock and Star for icons

// Interface for MenuItem (must match the one in MenuSection and VendorDashboard)
interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
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

interface FoodItemProps {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
}

const FoodItem: React.FC<FoodItemProps> = ({
  item,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart,
}) => {
  return (
    <Card className="overflow-hidden shadow-lg rounded-xl transition-all hover:scale-[1.02] duration-300">
      <div className="relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => { e.currentTarget.src = "https://placehold.co/300x200/cccccc/333333?text=No+Image"; }}
        />
        {/* Veg/Non-Veg Badge */}
        <Badge
          className={`absolute top-3 left-3 px-3 py-1 text-sm font-medium rounded-full ${
            item.isVeg ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {item.isVeg ? "Veg" : "Non-Veg"}
        </Badge>

        {/* Rating Badge */}
        {item.rating > 0 && (
          <Badge
            className="absolute top-3 right-3 px-3 py-1 text-sm font-medium rounded-full bg-yellow-500 text-white flex items-center gap-1"
          >
            <Star className="h-3 w-3 fill-current text-white" />
            {item.rating.toFixed(1)}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <CardTitle className="text-xl font-bold mb-2">{item.name}</CardTitle>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        {/* --- Dietary Badges --- */}
        {/* These badges will only appear if the corresponding boolean flag in the 'item' data is TRUE */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.isKetoFriendly && <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Keto</Badge>}
          {item.isLowCarb && <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Low Carb</Badge>}
          {item.isHighProtein && <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">High Protein</Badge>}
        </div>
        {/* --- End Dietary Badges --- */}

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-orange-600">
            ₹{item.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 flex items-center">
            <Clock className="inline-block h-4 w-4 mr-1 text-gray-400" />
            {item.preparationTime}
          </span>
        </div>

        <div className="flex justify-center items-center gap-2">
          {cartQuantity === 0 ? (
            <Button onClick={onAddToCart} className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
              <Plus className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          ) : (
            <div className="flex items-center w-full justify-between border border-gray-300 rounded-md">
              <Button
                variant="outline"
                size="icon"
                onClick={onRemoveFromCart}
                className="rounded-r-none h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 font-semibold text-lg">{cartQuantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={onAddToCart}
                className="rounded-l-none h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodItem;
