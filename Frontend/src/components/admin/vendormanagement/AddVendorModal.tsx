import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShopCreationRequest } from './types'; // Import the new combined form data type

interface AddVendorModalProps {
  show: boolean;
  onClose: () => void;
  formData: ShopCreationRequest; // Use the new ShopCreationRequest type
  setFormData: React.Dispatch<React.SetStateAction<ShopCreationRequest>>; // Use new ShopCreationRequest type
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({ show, onClose, formData, setFormData, onSubmit, isPending }) => {
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
            className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-6">Add New Food Outlet & Vendor</h2>
            <form onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Outlet Details (Shop) */}
                <div className="md:col-span-2 text-lg font-semibold text-gray-700">Outlet Details</div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Outlet Name *</Label>
                  <Input
                    placeholder="Enter outlet name"
                    value={formData.name} // Maps to ShopDto.name
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Outlet Contact Number *</Label>
                  <Input
                    placeholder="Enter outlet contact number"
                    value={formData.contactNumber} // Maps to ShopDto.contactNumber
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Location (Address) *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.address} // Maps to ShopDto.address
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  >
                    <option value="">Select Location</option>
                    <option value="SRZ SDB Floor 1 Wing A">SRZ SDB Floor 1 Wing A</option>
                    <option value="SRZ SDB Floor 1 Wing B">SRZ SDB Floor 1 Wing B</option>
                    <option value="SRZ SDB2 Floor 2 Wing A">SRZ SDB2 Floor 2 Wing A</option>
                    <option value="SRZ SDB1 Floor 2 Wing B">SRZ SDB1 Floor 2 Wing B</option>
                  </select>
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Outlet Type (Cuisine) *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.cuisine} // Maps to ShopDto.cuisine
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    required
                  >
                    <option value="Healthy Food">Healthy Food</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Cafe and Beverages">Cafe and Beverages</option>
                    <option value="Multi Cuisine">Multi Cuisine</option>
                    <option value="Snack and Refreshment">Snack and Refreshment</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                {/* Optional: Outlet Active status */}
                <div className="flex items-center gap-2 mt-4 md:col-span-2">
                  <input
                    type="checkbox"
                    id="shopActive"
                    // --- FIX IS HERE ---
                    checked={formData.isActive} // Changed from formData.active to formData.isActive
                    onChange={(e) => setFormData({ ...formData, isActive: (e.target as HTMLInputElement).checked })}  // Changed from active to isActive
                    // --- END FIX ---
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="shopActive">Outlet is Active</Label>
                </div>

                {/* Vendor Credentials (Nested in ShopDto) */}
                <div className="md:col-span-2 text-lg font-semibold text-gray-700 mt-6">Vendor Credentials</div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Vendor Name *</Label>
                  <Input
                    placeholder="Enter vendor's full name"
                    value={formData.vendorName} // Maps to ShopDto.vendorName
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Vendor Email *</Label>
                  <Input
                    type="email"
                    placeholder="Enter vendor email"
                    value={formData.vendorEmail} // Maps to ShopDto.vendorEmail
                    onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Vendor Username *</Label>
                  <Input
                    placeholder="Enter vendor's login username"
                    value={formData.vendorUsername} // Maps to ShopDto.vendorUsername
                    onChange={(e) => setFormData({ ...formData, vendorUsername: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Vendor Password *</Label>
                  <Input
                    type="password"
                    placeholder="Enter vendor's initial password"
                    value={formData.vendorPassword} // Maps to ShopDto.vendorPassword
                    onChange={(e) => setFormData({ ...formData, vendorPassword: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Vendor Contact Number *</Label>
                  <Input
                    placeholder="Enter vendor's contact number"
                    value={formData.vendorContactNumber} // Maps to ShopDto.vendorContactNumber
                    onChange={(e) => setFormData({ ...formData, vendorContactNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Outlet & Vendor'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddVendorModal;