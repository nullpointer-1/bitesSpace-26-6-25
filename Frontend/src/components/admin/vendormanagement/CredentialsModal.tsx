
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Send } from 'lucide-react';
import { Vendor } from './types';

interface CredentialsModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  vendor: Vendor | null;
  credentials: { username: string; password: string };
  generatePassword: () => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({
  show,
  onClose,
  onConfirm,
  isPending,
  vendor,
  credentials,
  generatePassword,
}) => {
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
            <h2 className="text-xl font-semibold mb-4">Generate Credentials</h2>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Username</Label>
                <Input value={credentials.username} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Password</Label>
                <div className="flex space-x-2">
                  <Input value={credentials.password} readOnly className="bg-gray-100" />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                {isPending ? 'Sending...' : 'Send Credentials'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CredentialsModal;