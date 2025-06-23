import { useState, useEffect } from "react"; // Import useEffect
import { Link } from "react-router-dom";
import { ShoppingCart, MapPin, Clock, Star,ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios"; // Import axios for HTTP requests

// Remove the static foodStalls array - we'll fetch this dynamically
// const foodStalls = [...]

const Index = () => {
  const [cartItems, setCartItems] = useState(0); // This state can be managed elsewhere or fetched
  const [shops, setShops] = useState([]); // State to hold the fetched shops
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null);   // State to manage error messages

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null);   // Clear any previous errors

        // Make the GET request to your Spring Boot backend's shops endpoint
        // Ensure your Spring Boot backend is running on http://localhost:8080
        // and CORS is configured to allow http://localhost:3000 (or your React app's port)
        const response = await axios.get('http://localhost:8081/api/shops');

        // Assuming your backend returns an array of shop objects directly
        setShops(response.data);
      } catch (err) {
        // Handle any errors that occur during the fetch operation
        console.error("Error fetching shops:", err);
        setError('Failed to load shops. Please ensure the backend is running and reachable.');
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (success or error)
      }
    };

    fetchShops(); // Call the fetch function
  }, []); // The empty dependency array ensures this effect runs only once after the initial render

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading delicious food stalls...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-lg text-red-700 font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">FoodiePickup</h1>
              <Badge className="ml-3 bg-green-100 text-green-800">Pickup Only</Badge>
            </div>
            <div className="flex items-center space-x-4">
            
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              
              <Link to="/cart" className="relative">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart ({cartItems})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Delicious Food, Ready for Pickup
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Order from your favorite local food stalls and pick up fresh, hot meals
          </p>
          <div className="flex items-center justify-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            <span>Available in your area</span>
          </div>
        </div>
      </section>

      {/* Featured Stalls */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Featured Food Stalls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {shops.filter(shop => shop.featured).map((shop) => ( // Use 'shops' state
              <Link key={shop.id} to={`/stall/${shop.id}`} className="group">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="relative">
                    <img
                      src={shop.imageUrl} // Use shop.imageUrl
                      alt={shop.name}
                      className="w-full h-48 object-cover"
                    />
                    {shop.isVeg && (
                      <Badge className="absolute top-3 left-3 bg-green-600">Pure Veg</Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h4>
                    <p className="text-gray-600 mb-3">{shop.speciality}</p> {/* Use shop.speciality */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{shop.rating}</span> {/* Use shop.rating */}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {shop.deliveryTime} {/* Use shop.deliveryTime */}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {shop.distance} {/* Use shop.distance */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* All Stalls */}
          <h3 className="text-3xl font-bold text-gray-900 mb-8">All Food Stalls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => ( // Use 'shops' state
              <Link key={shop.id} to={`/stall/${shop.id}`} className="group">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="relative">
                    <img
                      src={shop.imageUrl} // Use shop.imageUrl
                      alt={shop.name}
                      className="w-full h-48 object-cover"
                    />
                    {shop.isVeg && (
                      <Badge className="absolute top-3 left-3 bg-green-600">Pure Veg</Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h4>
                    <p className="text-gray-600 mb-1">{shop.cuisine} • {shop.speciality}</p> {/* Use shop.cuisine and shop.speciality */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{shop.rating}</span> {/* Use shop.rating */}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {shop.deliveryTime} {/* Use shop.deliveryTime */}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {shop.distance} {/* Use shop.distance */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">FoodiePickup</h3>
          <p className="text-gray-400">Order online, pickup fresh. Supporting local food stalls.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;