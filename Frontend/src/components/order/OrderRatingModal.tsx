import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios"; // Import axios
import { useUser } from "@/context/UserContext"; // Import useUser to get userId

interface OrderRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string; // The custom UUID orderId
  shopId: number; // The shopId from the OrderData
  stallName: string;
}

const OrderRatingModal = ({ isOpen, onClose, orderId, shopId, stallName }: OrderRatingModalProps) => {
  const { user } = useUser(); // Get user from context
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !user.id) {
        toast({
            title: "Authentication Required",
            description: "Please log in to submit a rating.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);

    try {
        const payload = {
            orderId: orderId,
            userId: Number(user.id), // Convert to number for backend (assuming Long)
            shopId: shopId,
            rating: rating,
            review: review.trim() // Send trimmed review, or null if empty
        };

        const response = await axios.post("http://localhost:8081/api/ratings/submit", payload);
        
        toast({
            title: "Thank You!",
            description: "Your rating has been submitted successfully.",
            variant: "success",
        });
        onClose(); // Close modal on success
    } catch (error: any) {
        console.error("Error submitting rating:", error);
        toast({
            title: "Rating Submission Failed",
            description: error.response?.data || "Failed to submit your rating. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className="p-1"
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Rate Your Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-medium mb-2">How was your experience with</h3>
            <p className="text-lg font-semibold text-primary">{stallName}?</p>
            <p className="text-sm text-muted-foreground mt-1">Order #{orderId}</p>
          </div>

          <div className="flex justify-center">
            <div className="flex">{renderStars()}</div>
          </div>

          {rating > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with other customers..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Skip
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmitRating}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderRatingModal;
