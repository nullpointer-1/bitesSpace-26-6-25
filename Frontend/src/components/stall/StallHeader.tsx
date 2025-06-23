
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StallHeaderProps {
  stallName: string;
  totalItems: number;
}

const StallHeader = ({ stallName, totalItems }: StallHeaderProps) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link to="/user/browse/stalls">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">{stallName}</h1>
          </div>
          {totalItems > 0 && (
            <Link to="/cart">
              <Button className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                View Cart ({totalItems})
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default StallHeader;
