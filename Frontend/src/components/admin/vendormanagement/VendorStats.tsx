
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface VendorStatsProps {
  loadingVendors: boolean;
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
}

const VendorStats: React.FC<VendorStatsProps> = ({ loadingVendors, totalVendors, activeVendors, inactiveVendors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-800">{loadingVendors ? <Skeleton className="h-8 w-16" /> : totalVendors}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ToggleRight className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Active</p>
                <p className="text-3xl font-bold text-green-600">{loadingVendors ? <Skeleton className="h-8 w-16" /> : activeVendors}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ToggleRight className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inactive</p>
                <p className="text-3xl font-bold text-red-600">{loadingVendors ? <Skeleton className="h-8 w-16" /> : inactiveVendors}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ToggleLeft className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VendorStats;