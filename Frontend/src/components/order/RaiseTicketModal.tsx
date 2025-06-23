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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ticket, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios"; // Import axios
import { useUser } from "@/context/UserContext"; // Import useUser to get userId

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string; // The custom UUID orderId
  shopId: number; // The shopId from the OrderData
  stallName: string;
}

const ticketTypes = [
  { value: "food-quality", label: "Food Quality Issue" },
  { value: "wrong-order", label: "Wrong Order Received" },
  { value: "delivery-delay", label: "Delivery Delay" }, // Note: Your current app is pickup, so this might be less relevant unless you add delivery.
  { value: "missing-items", label: "Missing Items" },
  { value: "refund", label: "Refund Request" },
  { value: "other", label: "Other Issue" },
];

const RaiseTicketModal = ({ isOpen, onClose, orderId, shopId, stallName }: RaiseTicketModalProps) => {
  const { user } = useUser(); // Get user from context
  const [ticketType, setTicketType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketId, setTicketId] = useState(""); // This will come from backend response

  const handleSubmitTicket = async () => {
    if (!ticketType || !subject.trim() || !description.trim()) { // Added trim() validation
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !user.id) {
        toast({
            title: "Authentication Required",
            description: "Please log in to raise a ticket.",
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
            ticketType: ticketType,
            subject: subject.trim(),
            description: description.trim()
        };

        const response = await axios.post("http://localhost:8081/api/tickets/raise", payload);
        
        // Assuming backend returns the generated ticket ID
        const newTicketId = response.data.ticketId; 
        setTicketId(newTicketId);
        setTicketCreated(true);
        
        toast({
            title: "Ticket Created Successfully",
            description: `Your ticket #${newTicketId} has been submitted. We will get back to you soon.`,
            variant: "success",
        });
    } catch (error: any) {
        console.error("Error raising ticket:", error);
        toast({
            title: "Ticket Submission Failed",
            description: error.response?.data || "Failed to raise your ticket. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state when modal is closed
    setTicketType("");
    setSubject("");
    setDescription("");
    setTicketCreated(false);
    setTicketId("");
    onClose();
  };

  if (ticketCreated) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Ticket className="h-5 w-5" />
              Ticket Created Successfully
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="p-6 bg-green-50 rounded-lg">
              <AlertCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Your ticket has been submitted!</h3>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Ticket #{ticketId}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  We'll contact you within 24 hours to resolve your issue.
                </p>
              </div>
            </div>
            
            <div className="text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stall:</span>
                <span className="font-medium">{stallName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Type:</span>
                <span className="font-medium">
                  {ticketTypes.find(t => t.value === ticketType)?.label}
                </span>
              </div>
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Raise a Ticket
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Order:</span> #{orderId}
            </p>
            <p className="text-sm">
              <span className="font-medium">Stall:</span> {stallName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-type">Issue Type *</Label>
            <Select value={ticketType} onValueChange={setTicketType}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseTicketModal;
