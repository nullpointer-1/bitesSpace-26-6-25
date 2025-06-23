import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Add any other components or hooks needed for browsing stalls (e.g., product lists, search bar)
// import { Search } from 'lucide-react'; 

const UserBrowseStallsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="bg-white shadow-sm py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Browse Food Stalls</h1>
          <Link to="/login/user">
            <Button variant="outline">Login / Sign Up</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* This is where your actual stall listing content would go */}
        <p className="text-gray-600 mb-6">Discover amazing food stalls near you!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Stall Card - replace with dynamic data */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Spice Heaven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-2">Authentic Indian Cuisine</p>
              <p className="text-xs text-muted-foreground">Rating: 4.8 (250+ reviews)</p>
              <Link to="/stall/123">
                <Button className="mt-4 w-full">View Stall</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Burger Bliss</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-2">Gourmet Burgers & Fries</p>
              <p className="text-xs text-muted-foreground">Rating: 4.5 (180+ reviews)</p>
              <Link to="/stall/456">
                <Button className="mt-4 w-full">View Stall</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Add more stall cards or a dynamic map/list here */}
        </div>
      </div>
    </div>
  );
};

export default UserBrowseStallsPage;
