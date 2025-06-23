import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Vendor } from './types'; // Import the new Vendor interface

interface VendorSearchProps {
  vendors: Vendor[]; // Use the defined Vendor interface
  onVendorSelect: (vendor: Vendor) => void; // Use the defined Vendor interface
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const VendorSearch: React.FC<VendorSearchProps> = ({
  vendors,
  onVendorSelect,
  searchTerm,
  setSearchTerm
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter vendors based on 'name' (from backend VendorDto)
  const filteredVendors = vendors.filter(vendor =>
    // Ensure vendor.name is not null or undefined before calling toLowerCase()
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVendorClick = (vendor: Vendor) => {
    setSearchTerm(vendor.name); // Use vendor.name for the search input
    setShowSuggestions(false);
    onVendorSelect(vendor);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search vendor by name, username or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(searchTerm.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && filteredVendors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto"
          >
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id || index} // Use vendor.id as key, fallback to index
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleVendorClick(vendor)}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {/* Display vendor.name and vendor.email/username which are available in VendorDto */}
                <div className="font-medium text-gray-800">{vendor.name} ({vendor.username})</div>
                <div className="text-sm text-gray-600">{vendor.email} {vendor.contactNumber ? ` • ${vendor.contactNumber}` : ''}</div>
                {/* Removed outletType and location as they are not directly in VendorDto. */}
                {/* If these are needed, consider augmenting your backend DTO or fetching Shop details. */}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorSearch;