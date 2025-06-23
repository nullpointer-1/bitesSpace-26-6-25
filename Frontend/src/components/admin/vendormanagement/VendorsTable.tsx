
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import { Vendor } from './types';

interface VendorsTableProps {
  vendors: Vendor[];
  loadingVendors: boolean;
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  onGenerateCredentials: (vendor: Vendor) => void;
  onToggleStatus: (id: number) => void;
}

const VendorsTable: React.FC<VendorsTableProps> = ({
  vendors,
  loadingVendors,
  onView,
  onEdit,
  onDelete,
  onGenerateCredentials,
  onToggleStatus,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Vendors ({vendors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Outlet Name</th>
                <th className="text-left p-4">Vendor</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingVendors ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-48" /></td>
                  </tr>
                ))
              ) : vendors.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-8">No vendors found.</td></tr>
              ) : (
                vendors.map((vendor) => (
                  <motion.tr
                    key={vendor.id}
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="p-4 font-medium">{vendor.shopName}</td>
                    <td className="p-4">{vendor.name}</td>
                    <td className="p-4">{vendor.email}</td>
                    <td className="p-4">{vendor.shopAddress}</td>
                    <td className="p-4">{vendor.shopCuisine}</td>
                    <td className="p-4">
                      <Badge variant={vendor.isActive ? "default" : "destructive"} className={vendor.isActive ? "bg-green-600" : ""}>
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onView(vendor)} title="View Details" className="hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(vendor)} title="Edit Vendor" className="hover:bg-yellow-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDelete(vendor)} title="Delete Vendor" className="hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onGenerateCredentials(vendor)} title="Generate Credentials" className="hover:bg-green-50">
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onToggleStatus(vendor.id)} title="Toggle Status" className="hover:bg-purple-50">
                          {vendor.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorsTable;