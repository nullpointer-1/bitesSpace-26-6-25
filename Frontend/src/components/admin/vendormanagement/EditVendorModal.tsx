import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateVendorRequest, Vendor } from './types';

interface EditVendorModalProps {
  show: boolean;
  onClose: () => void;
  vendor: Vendor | null; // The original vendor object passed for context
  formData: UpdateVendorRequest; // The formData specifically for the update payload
  setFormData: React.Dispatch<React.SetStateAction<UpdateVendorRequest>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

const EditVendorModal: React.FC<EditVendorModalProps> = ({ show, onClose, vendor, formData, setFormData, onSubmit, isPending }) => {
  if (!vendor) return null; // Don't render if no vendor is selected

  // Internal state for form fields that might be modified
  // Initialize with values from `vendor` if present, or `formData` for controlled inputs
  const [currentFormData, setCurrentFormData] = React.useState<UpdateVendorRequest>({
    id: vendor.id,
    name: vendor.name, // Vendor's personal name
    email: vendor.email,
    username: vendor.username,
    contactNumber: vendor.contactNumber,
    isActive: vendor.isActive,
    shopId: vendor.shopId,
    password: '', // Never pre-fill password for security
  });

  // Effect to update internal form state when `vendor` prop changes
  React.useEffect(() => {
    if (vendor) {
      setCurrentFormData({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        username: vendor.username,
        contactNumber: vendor.contactNumber,
        isActive: vendor.isActive,
        shopId: vendor.shopId,
        password: '', // Always reset password field when editing
      });
    }
  }, [vendor]);

  // Handler for form input changes
  // In src/components/admin/EditVendorModal.tsx

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { id, value, type } = e.target; // Destructure without 'checked' initially

  setCurrentFormData(prev => ({
    ...prev,
    [id]: type === 'checkbox' // Check the type of the input
      ? (e.target as HTMLInputElement).checked // Type assert to HTMLInputElement to access 'checked'
      : value
  }));
};

  // When submitting, pass the internal state back up via setFormData and then onSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(currentFormData); // Update parent state with current form data
    onSubmit(e); // Trigger the parent's submit handler
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-6">Edit Vendor: {vendor.name}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium mb-2">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter vendor name"
                    value={currentFormData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium mb-2">Vendor Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter vendor email"
                    value={currentFormData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium mb-2">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={currentFormData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium mb-2">New Password (Leave blank to keep current)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={currentFormData.password || ''} // Handle null/undefined
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber" className="block text-sm font-medium mb-2">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    placeholder="Enter contact number"
                    value={currentFormData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Shop ID selection - only if you want to change which shop a vendor belongs to */}
                {/* For now, assuming shopId is stable, or not editable here */}
                {currentFormData.shopId && (
                  <div>
                    <Label htmlFor="shopId" className="block text-sm font-medium mb-2">Assigned Shop ID</Label>
                    <Input
                      id="shopId"
                      type="number"
                      value={currentFormData.shopId}
                      onChange={handleChange}
                      disabled // Often, shopId is not directly editable through vendor edit
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={currentFormData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="isActive">Vendor is Active</Label>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditVendorModal;