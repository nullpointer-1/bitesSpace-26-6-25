
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Vendor } from './types';

interface DeleteVendorModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  vendor: Vendor | null;
}

const DeleteVendorModal: React.FC<DeleteVendorModalProps> = ({ show, onClose, onConfirm, isPending, vendor }) => {
  return (
    <AnimatePresence>
      {show && vendor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-96 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this vendor? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700" disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteVendorModal;