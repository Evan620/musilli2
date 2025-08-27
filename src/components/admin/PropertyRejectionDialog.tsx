import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types";
import { XCircle, AlertTriangle } from "lucide-react";

interface PropertyRejectionDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (propertyId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

const COMMON_REJECTION_REASONS = [
  "Incomplete property information",
  "Poor quality images",
  "Unrealistic pricing",
  "Duplicate listing",
  "Property not available",
  "Insufficient property description",
  "Missing required documents",
  "Inappropriate content",
  "Location information incorrect",
  "Property condition concerns"
];

export const PropertyRejectionDialog = ({
  property,
  open,
  onOpenChange,
  onReject,
  isLoading = false
}: PropertyRejectionDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!property || !rejectionReason.trim()) return;

    setIsSubmitting(true);
    try {
      await onReject(property.id, rejectionReason.trim());
      setRejectionReason("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReasonSelect = (reason: string) => {
    setRejectionReason(reason);
  };

  const handleClose = () => {
    setRejectionReason("");
    onOpenChange(false);
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Reject Property
          </DialogTitle>
          <DialogDescription>
            You are about to reject this property. Please provide a reason that will be communicated to the provider.
          </DialogDescription>
        </DialogHeader>

        {/* Property Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-4">
            <img
              src={property.images[0]?.url || '/placeholder.svg'}
              alt={property.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{property.title}</h3>
              <p className="text-sm text-muted-foreground">
                {property.location.city}, {property.location.state}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{property.type}</Badge>
                <Badge variant="secondary">{property.category}</Badge>
                <span className="text-sm font-medium text-green-600">
                  {property.currency} {property.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Common Rejection Reasons */}
          <div>
            <Label className="text-sm font-medium">Common Rejection Reasons</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {COMMON_REJECTION_REASONS.map((reason) => (
                <Button
                  key={reason}
                  variant={rejectionReason === reason ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-auto py-2 px-3"
                  onClick={() => handleReasonSelect(reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason *
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Provide a detailed reason for rejecting this property..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2 min-h-[100px]"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                This reason will be sent to the provider
              </p>
              <span className="text-xs text-muted-foreground">
                {rejectionReason.length}/500
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                This action cannot be undone
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                The provider will be notified of the rejection and the reason provided. 
                They can edit and resubmit the property if needed.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? "Rejecting..." : "Reject Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
