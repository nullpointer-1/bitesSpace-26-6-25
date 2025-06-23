import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vendor } from './types'; // Ensure Vendor interface is correctly imported

interface ViewVendorModalProps {
  show: boolean;
  onClose: () => void;
  vendor: Vendor | null; // Use the Vendor interface
}

const ViewVendorModal: React.FC<ViewVendorModalProps> = ({ show, onClose, vendor }) => {
  return (
    <AnimatePresence>
      {show && vendor && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-4">Vendor Details</h2>
            <div className="space-y-3">
              {/* Displaying properties from VendorDto, now including shop details */}
              <div><strong>Vendor Name:</strong> {vendor.name}</div> {/* Vendor's personal name */}
              <div><strong>Username:</strong> {vendor.username}</div>
              <div><strong>Email:</strong> {vendor.email}</div>
              <div><strong>Vendor Contact:</strong> {vendor.contactNumber}</div>
              <div><strong>Vendor Status:</strong>
                <Badge variant={vendor.active ? "default" : "destructive"} className="ml-2">
                  {vendor.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {/* Displaying Shop Details that are now part of the Vendor interface */}
              {vendor.shopName && <div><strong>Outlet Name:</strong> {vendor.shopName}</div>}
              {vendor.shopAddress && <div><strong>Location:</strong> {vendor.shopAddress}</div>}
              {vendor.shopCuisine && <div><strong>Outlet Type:</strong> {vendor.shopCuisine}</div>}
              {vendor.shopActive !== null && <div><strong>Outlet Status:</strong>
                <Badge variant={vendor.shopActive ? "default" : "destructive"} className="ml-2">
                  {vendor.shopActive ? "Active" : "Inactive"}
                </Badge>
              </div>}
              {vendor.shopId !== null && <div><strong>Shop ID:</strong> {vendor.shopId}</div>}
            </div>
            <Button onClick={onClose} className="w-full mt-4">
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewVendorModal;