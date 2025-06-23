
import { Star, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StallHeroProps {
  stall: {
    name: string;
    image: string;
    rating: number;
    time: string;
    distance: string;
    cuisine: string;
    speciality: string;
    isVeg: boolean;
  };
}

const StallHero = ({ stall }: StallHeroProps) => {
  return (
    <section className="relative">
      <img
        src={stall.image}
        alt={stall.name}
        className="w-full h-64 object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-2">{stall.name}</h2>
            <p className="text-xl mb-4">{stall.cuisine} • {stall.speciality}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{stall.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                {stall.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                {stall.distance}
              </div>
              {stall.isVeg && <Badge className="bg-green-600">Pure Veg</Badge>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StallHero;
