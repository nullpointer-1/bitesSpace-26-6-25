import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Users, Clock, Star } from "lucide-react"; // Assuming these icons are used

// Define the expected properties for the vendor object that VendorStats uses
interface VendorStatsProps {
  vendor: {
    totalOrders?: number;
    totalRevenue?: number;
    rating?: number; // Assuming rating might also be displayed
    isOnline?: boolean; // Assuming status might also be displayed
    // Add any other properties from your VendorDetails interface that VendorStats consumes
  };
}

const VendorStats: React.FC<VendorStatsProps> = ({ vendor }) => {
  // Use nullish coalescing (??) to provide a default value (0 or 0.0)
  // if the property is undefined or null. This ensures toLocaleString is always called on a number.
  const displayTotalOrders = vendor.totalOrders ?? 0;
  const displayTotalRevenue = vendor.totalRevenue ?? 0;
  const displayRating = vendor.rating ?? 0.0; 
  const displayIsOnline = vendor.isOnline ?? false; // Provide a default for boolean too

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Orders Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {/* Safely call toLocaleString() */}
            {displayTotalOrders.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Orders fulfilled</p>
        </CardContent>
      </Card>

      {/* Total Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {/* Safely call toLocaleString() for currency */}
            ₹{displayTotalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground">Revenue generated</p>
        </CardContent>
      </Card>

      {/* Customer Rating Card (Assuming it exists based on VendorDashboard's structure) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayRating.toFixed(1)} {/* Display rating with one decimal place */}
          </div>
          <p className="text-xs text-muted-foreground">Average rating</p>
        </CardContent>
      </Card>

       {/* Store Status Card (Example, adjust if your VendorStats displays this) */}
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Store Status</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayIsOnline ? "Online" : "Offline"}
          </div>
          <p className="text-xs text-muted-foreground">Operational status</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorStats;
