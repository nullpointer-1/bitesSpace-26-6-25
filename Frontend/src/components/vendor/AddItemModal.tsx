import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define the type for the data that will be passed up to the parent
// Ensure all boolean flags and rating are included here
interface NewItemFormData {
  name: string;
  price: number;
  description: string;
  category: string;
  isVeg: boolean;
  preparationTime: string;
  imageUrl: string;
  rating: number; // Ensure this is always a number
  isKetoFriendly: boolean;
  isHighProtein: boolean;
  isLowCarb: boolean;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This function will be provided by the parent (VendorDashboard)
  // It expects the complete form data and returns a Promise to handle async operations
  onAddItem: (newItemData: NewItemFormData) => Promise<void>;
}

const AddItemModal = ({ isOpen, onClose, onAddItem }: AddItemModalProps) => {
  const [formData, setFormData] = useState<NewItemFormData>({
    name: "",
    price: 0,
    description: "",
    category: "Main Course",
    isVeg: true,
    preparationTime: "",
    imageUrl: "https://placehold.co/300x200/cccccc/333333?text=Food+Item", // Default fallback image
    rating: 0.0, // Initialize as 0.0
    isKetoFriendly: false,
    isHighProtein: false,
    isLowCarb: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic client-side validation
    if (!formData.name.trim() || formData.price <= 0 || !formData.category.trim() || !formData.preparationTime.trim()) {
      // You might want to add a toast/message here for immediate user feedback
      // For example: toast({ title: "Validation Error", description: "Please fill in all required fields and ensure price is greater than 0.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddItem(formData); // Pass the entire formData object to the parent
      // Reset form fields only on successful add (handled by parent's toast for success)
      setFormData({
        name: "",
        price: 0,
        description: "",
        category: "Main Course",
        isVeg: true,
        preparationTime: "",
        imageUrl: "https://placehold.co/300x200/cccccc/333333?text=Food+Item",
        rating: 0.0,
        isKetoFriendly: false,
        isHighProtein: false,
        isLowCarb: false,
      });
      onClose(); // Close the modal
    } catch (error) {
      // Error handling is managed by the parent's `onAddItem` (VendorDashboard's `handleAddItem`)
      console.error("Error from onAddItem in modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    // Reset form fields on close
    setFormData({
      name: "",
      price: 0,
      description: "",
      category: "Main Course",
      isVeg: true,
      preparationTime: "",
      imageUrl: "https://placehold.co/300x200/cccccc/333333?text=Food+Item",
      rating: 0.0,
      isKetoFriendly: false,
      isHighProtein: false,
      isLowCarb: false,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => {
      let newValue: any; // Use 'any' temporarily for flexibility in type assignment
      if (type === 'checkbox') {
        newValue = checked;
      } else if (type === 'number') {
        // Explicitly handle number parsing. If value is empty, default to 0.
        // If it's not a valid number (e.g., "abc"), parseFloat will be NaN, so default to 0.
        newValue = value === '' ? 0 : parseFloat(value);
        if (isNaN(newValue)) {
          newValue = 0; // Fallback for invalid numeric input
        }
      } else {
        newValue = value;
      }
      return {
        ...prev,
        [id]: newValue
      };
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, isVeg: value === "true" }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add New Item</h2>
            <Button variant="ghost" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Preview */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Item Image URL</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <img
                  src={formData.imageUrl}
                  alt="Item preview"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/300x200/cccccc/333333?text=No+Image"; }}
                />
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                />
              </div>
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Enter item description"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Main Course">Main Course</option>
                <option value="Appetizer">Appetizer</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            {/* Veg/Non-Veg */}
            <div className="space-y-2">
              <Label>Food Type</Label>
              <RadioGroup value={formData.isVeg ? "true" : "false"} onValueChange={handleRadioChange} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="isVegTrue" />
                  <Label htmlFor="isVegTrue">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="isVegFalse" />
                  <Label htmlFor="isVegFalse">Non-Vegetarian</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Preparation Time */}
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Preparation Time (e.g., 15-20 min)</Label>
              <Input
                id="preparationTime"
                type="text"
                value={formData.preparationTime}
                onChange={handleChange}
                placeholder="e.g., 15-20 min"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating} // Bound to the numeric state
                onChange={handleChange}
                placeholder="e.g., 4.5"
              />
            </div>

            {/* Dietary Flags */}
            <div className="space-y-2">
              <Label>Dietary Information</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    id="isKetoFriendly"
                    type="checkbox"
                    checked={formData.isKetoFriendly}
                    onChange={handleChange}
                    className="form-checkbox text-blue-600"
                  />
                  Keto-Friendly
                </label>
                <label className="flex items-center gap-2">
                  <input
                    id="isHighProtein"
                    type="checkbox"
                    checked={formData.isHighProtein}
                    onChange={handleChange}
                    className="form-checkbox text-blue-600"
                  />
                  High-Protein
                </label>
                <label className="flex items-center gap-2">
                  <input
                    id="isLowCarb"
                    type="checkbox"
                    checked={formData.isLowCarb}
                    onChange={handleChange}
                    className="form-checkbox text-blue-600"
                  />
                  Low-Carb
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddItemModal;