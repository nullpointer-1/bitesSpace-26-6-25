
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Ticket, CheckCircle } from "lucide-react";
import OrderRatingModal from "./OrderRatingModal";
import RaiseTicketModal from "./RaiseTicketModal";

interface PostDeliveryActionsProps {
  orderId: string;
  stallName: string;
  deliveredAt: string;
}

const PostDeliveryActions = ({ orderId, stallName, deliveredAt }: PostDeliveryActionsProps) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  return (
    <>
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Order Delivered Successfully!
          </CardTitle>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Order #{orderId}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Delivered: {new Date(deliveredAt).toLocaleString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your order from <span className="font-medium">{stallName}</span> has been delivered.
              How was your experience?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowRatingModal(true)}
              className="flex items-center gap-2"
              disabled={hasRated}
            >
              <Star className="h-4 w-4" />
              {hasRated ? "Rated" : "Rate Order"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-2"
            >
              <Ticket className="h-4 w-4" />
              Report Issue
            </Button>
          </div>

          {hasRated && (
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-sm text-green-600 font-medium">
                Thank you for your feedback!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderRatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setHasRated(true);
        }}
        orderId={orderId}
        stallName={stallName}
      />

      <RaiseTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        orderId={orderId}
        stallName={stallName}
      />
    </>
  );
};

export default PostDeliveryActions;