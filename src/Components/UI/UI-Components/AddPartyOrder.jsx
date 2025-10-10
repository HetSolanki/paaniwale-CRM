import { useState } from "react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createPartyOrder } from "@/Handlers/PartyOrderHandler";
import { Plus, Loader2 } from "lucide-react";

export function AddPartyOrder({ onSuccess }) {
  const [open, setOpen] = useState(false);
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
    notes: "",
  });

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
      // Validate phone number
      if (formData.party_phone.length !== 10) {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Phone number must be 10 digits",
        });
        return;
      }

      // Validate at least one bottle type
      if (
        formData.cold_bottle_quantity === 0 &&
        formData.normal_bottle_quantity === 0
      ) {
        toast({
          variant: "destructive",
          title: "Invalid Quantity",
          description: "Please add at least one bottle",
        });
        return;
      }

      await createPartyOrder(formData);

      toast({
        title: "Success",
        description: "Party order created successfully!",
      });

      setOpen(false);
      setFormData({
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
        notes: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create party order",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    formData.cold_bottle_quantity * formData.cold_bottle_price +
    formData.normal_bottle_quantity * formData.normal_bottle_price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Party Order
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Party Order</DialogTitle>
          <DialogDescription>
            Add a new bulk order for marriage, function, or party
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Party Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="party_name">
                  Party Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="party_name"
                  placeholder="Enter party name"
                  value={formData.party_name}
                  onChange={(e) => handleChange("party_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="party_phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="party_phone"
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
                <Label htmlFor="event_type">Event Type</Label>
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
                <Label htmlFor="delivery_date">
                  Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="delivery_date"
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
              <Label htmlFor="party_address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="party_address"
                placeholder="Enter complete address"
                value={formData.party_address}
                onChange={(e) => handleChange("party_address", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="party_location">Location/Landmark</Label>
              <Input
                id="party_location"
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
                  <Label htmlFor="cold_bottle_quantity">Quantity</Label>
                  <Input
                    id="cold_bottle_quantity"
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
                  <Label htmlFor="cold_bottle_price">Price per Bottle</Label>
                  <Input
                    id="cold_bottle_price"
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
                  <Label htmlFor="normal_bottle_quantity">Quantity</Label>
                  <Input
                    id="normal_bottle_quantity"
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
                  <Label htmlFor="normal_bottle_price">Price per Bottle</Label>
                  <Input
                    id="normal_bottle_price"
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
