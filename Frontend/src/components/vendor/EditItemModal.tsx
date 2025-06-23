// src/components/vendor/EditItemModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

// Standardized Item interface (matching MenuItem from VendorDashboard)
interface Item {
  id: number;
  name: string;
  price: number;
  imageUrl: string; // Changed from 'image' to 'imageUrl' for consistency
  description: string;
  isVeg: boolean;
  category: string;
  isAvailable: boolean;
  preparationTime: string;
  isKetoFriendly: boolean;
  isHighProtein: boolean;
  isLowCarb: boolean;
  rating: number; // Ensure rating is also included
  shopId: number; // Important for context, though often not updated here
}

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: Item; // Now uses the standardized 'Item' interface
  onUpdateItem: (
    id: number,
    // Ensure this Omit type matches exactly what handleUpdateItem expects
    updatedData: Omit<Item, 'id' | 'isAvailable' | 'shopId'>, // Remove 'shopId' if it's not being updated via this modal
    imageFile?: File | null // Keep File | null for clarity
  ) => Promise<void>; // Changed return type to Promise<void>
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  itemData,
  onUpdateItem,
}) => {
  const [formData, setFormData] = useState<
    Omit<Item, 'id' | 'isAvailable' | 'shopId'> & { imageFile: File | null }
  >({
    name: "",
    price: 0,
    imageUrl: "", // Changed from 'image' to 'imageUrl'
    description: "",
    isVeg: false,
    category: "",
    preparationTime: "",
    isKetoFriendly: false,
    isHighProtein: false,
    isLowCarb: false,
    rating: 0,
    imageFile: null,
  });

  useEffect(() => {
    if (itemData) {
      setFormData({
        name: itemData.name,
        price: itemData.price,
        imageUrl: itemData.imageUrl, // Set imageUrl from itemData
        description: itemData.description,
        isVeg: itemData.isVeg,
        category: itemData.category,
        preparationTime: itemData.preparationTime,
        isKetoFriendly: itemData.isKetoFriendly,
        isHighProtein: itemData.isHighProtein,
        isLowCarb: itemData.isLowCarb,
        rating: itemData.rating,
        imageFile: null, // Clear any previous image file selection
      });
    }
  }, [itemData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData((prev) => ({
      ...prev,
      price: isNaN(value) ? 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        imageFile: file, // Store the file itself
        imageUrl: URL.createObjectURL(file), // Update imageUrl for preview
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
        // If no file selected, revert to original imageUrl or clear if adding new
        imageUrl: itemData ? itemData.imageUrl : "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0 || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Price, Category).",
        variant: "destructive",
      });
      return;
    }

    try {
      // Omit imageFile as it's handled separately or not part of the direct product DTO
      const { imageFile, ...dataToUpdate } = formData;
      
      // Pass the itemData.id as the first argument, and the rest of the form data
      // (including imageUrl, which might be new from imageFile preview)
      // and the actual imageFile.
      await onUpdateItem(itemData.id, dataToUpdate, imageFile);
      onClose();
    } catch (error) {
      console.error("Failed to update item:", error);
      // The toast is already handled by onUpdateItem in VendorDashboard
    }
  };

  if (!itemData) return null; // Should not happen if logic is correct

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item: {itemData.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₹)
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handlePriceChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <Input
              id="imageUrl" // Changed from 'image' to 'imageUrl'
              name="imageUrl" // Changed from 'image' to 'imageUrl'
              value={formData.imageUrl}
              onChange={handleChange}
              className="col-span-3"
              placeholder="e.g., https://example.com/item.jpg"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUpload" className="text-right">
              Upload Image
            </Label>
            <Input
              id="imageUpload"
              name="imageUpload"
              type="file"
              onChange={handleImageChange}
              className="col-span-3"
              accept="image/*"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preparationTime" className="text-right">
              Prep Time
            </Label>
            <Input
              id="preparationTime"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              className="col-span-3"
              placeholder="e.g., 20 mins"
            />
          </div>

          {/* Checkboxes for Dietary Flags */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isVeg" className="text-right">
              Vegetarian
            </Label>
            <Checkbox
              id="isVeg"
              name="isVeg"
              checked={formData.isVeg}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isVeg: Boolean(checked) }))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isKetoFriendly" className="text-right">
              Keto Friendly
            </Label>
            <Checkbox
              id="isKetoFriendly"
              name="isKetoFriendly"
              checked={formData.isKetoFriendly}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isKetoFriendly: Boolean(checked) }))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isHighProtein" className="text-right">
              High Protein
            </Label>
            <Checkbox
              id="isHighProtein"
              name="isHighProtein"
              checked={formData.isHighProtein}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isHighProtein: Boolean(checked) }))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isLowCarb" className="text-right">
              Low Carb
            </Label>
            <Checkbox
              id="isLowCarb"
              name="isLowCarb"
              checked={formData.isLowCarb}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isLowCarb: Boolean(checked) }))
              }
              className="col-span-3"
            />
          </div>
          {/* Rating input (assuming it can be edited, or remove if not) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating
            </Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData((prev) => ({ ...prev, rating: parseFloat(e.target.value) }))}
              className="col-span-3"
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemModal;