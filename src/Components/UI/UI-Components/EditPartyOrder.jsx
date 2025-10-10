import { useState, useEffect } from "react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/UI/shadcn-UI/dialog";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { Textarea } from "@/Components/UI/shadcn-UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { updatePartyOrder } from "@/Handlers/PartyOrderHandler";
import { Loader2 } from "lucide-react";

export function EditPartyOrder({ order, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    party_name: "",
    party_phone: "",
    party_address: "",
    party_location: "",
    event_type: "Other",
    delivery_date: "",
    cold_bottle_quantity: 0,
    cold_bottle_price: 0,
    normal_bottle_quantity: 0,
    normal_bottle_price: 0,
    status: "Pending",
    notes: "",
  });

  useEffect(() => {
    if (order) {
      setFormData({
        party_name: order.party_name || "",
        party_phone: order.party_phone || "",
        party_address: order.party_address || "",
        party_location: order.party_location || "",
        event_type: order.event_type || "Other",
        delivery_date: order.delivery_date
          ? new Date(order.delivery_date).toISOString().split("T")[0]
          : "",
        cold_bottle_quantity: order.cold_bottle_quantity || 0,
        cold_bottle_price: order.cold_bottle_price || 0,
        normal_bottle_quantity: order.normal_bottle_quantity || 0,
        normal_bottle_price: order.normal_bottle_price || 0,
        status: order.status || "Pending",
        notes: order.notes || "",
      });
    }
  }, [order]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePartyOrder(order._id, formData);

      toast({
        title: "Success",
        description: "Party order updated successfully!",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update party order",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    formData.cold_bottle_quantity * formData.cold_bottle_price +
    formData.normal_bottle_quantity * formData.normal_bottle_price;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Party Order</DialogTitle>
          <DialogDescription>Update party order details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Party Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_party_name">
                  Party Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_party_name"
                  placeholder="Enter party name"
                  value={formData.party_name}
                  onChange={(e) => handleChange("party_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_party_phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_party_phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.party_phone}
                  onChange={(e) =>
                    handleChange(
                      "party_phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_event_type">Event Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => handleChange("event_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marriage">Marriage</SelectItem>
                    <SelectItem value="Function">Function</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                    <SelectItem value="Corporate Event">
                      Corporate Event
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_delivery_date">
                  Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) =>
                    handleChange("delivery_date", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_party_address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit_party_address"
                placeholder="Enter complete address"
                value={formData.party_address}
                onChange={(e) => handleChange("party_address", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_party_location">Location/Landmark</Label>
              <Input
                id="edit_party_location"
                placeholder="e.g., Near XYZ Mall"
                value={formData.party_location}
                onChange={(e) => handleChange("party_location", e.target.value)}
              />
            </div>

            {/* Cold Bottles */}
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                ❄️ Cold Bottles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_cold_bottle_quantity">Quantity</Label>
                  <Input
                    id="edit_cold_bottle_quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.cold_bottle_quantity}
                    onChange={(e) =>
                      handleChange(
                        "cold_bottle_quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_cold_bottle_price">
                    Price per Bottle
                  </Label>
                  <Input
                    id="edit_cold_bottle_price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.cold_bottle_price}
                    onChange={(e) =>
                      handleChange(
                        "cold_bottle_price",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Subtotal: ₹
                {formData.cold_bottle_quantity * formData.cold_bottle_price}
              </p>
            </div>

            {/* Normal Bottles */}
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                🌡️ Normal Bottles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_normal_bottle_quantity">Quantity</Label>
                  <Input
                    id="edit_normal_bottle_quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.normal_bottle_quantity}
                    onChange={(e) =>
                      handleChange(
                        "normal_bottle_quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_normal_bottle_price">
                    Price per Bottle
                  </Label>
                  <Input
                    id="edit_normal_bottle_price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.normal_bottle_price}
                    onChange={(e) =>
                      handleChange(
                        "normal_bottle_price",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Subtotal: ₹
                {formData.normal_bottle_quantity * formData.normal_bottle_price}
              </p>
            </div>

            {/* Total Amount */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <p className="text-lg font-bold">Total Amount: ₹{totalAmount}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                placeholder="Any special instructions..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
