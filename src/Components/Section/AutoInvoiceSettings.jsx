import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { Switch } from "@/Components/UI/shadcn-UI/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Separator } from "@/Components/UI/shadcn-UI/separator";
import {
  CalendarClock,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import axios from "axios";

export default function AutoInvoiceSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [nextInvoiceDate, setNextInvoiceDate] = useState(null);
  const [lastRunDate, setLastRunDate] = useState(null);

  const [settings, setSettings] = useState({
    auto_invoice_enabled: false,
    auto_invoice_day: 1,
    auto_invoice_time: "09:00",
  });

  // Fetch current settings on mount
  useEffect(() => {
    fetchSettings();
    fetchNextInvoiceDate();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success" && response.data.data) {
        const data = response.data.data;
        setSettings({
          auto_invoice_enabled: data.auto_invoice_enabled || false,
          auto_invoice_day: data.auto_invoice_day || 1,
          auto_invoice_time: data.auto_invoice_time || "09:00",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchNextInvoiceDate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/auto-invoice/next`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success" && response.data.data) {
        setNextInvoiceDate(response.data.data.nextDate);
        setLastRunDate(response.data.data.lastRun);
      }
    } catch (error) {
      console.error("Error fetching next invoice date:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "Success",
          description: "Auto invoice settings saved successfully",
        });
        setHasChanges(false);
        fetchNextInvoiceDate(); // Refresh next date
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNow = async () => {
    const confirm = window.confirm(
      "This will send invoices to all customers with entries from last month. Continue?"
    );

    if (!confirm) return;

    try {
      setTriggering(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auto-invoice/trigger`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        const { sent, failed } = response.data.data;
        toast({
          title: "Invoices Sent",
          description: `Successfully sent ${sent} invoice(s). ${failed} failed.`,
        });
        fetchNextInvoiceDate(); // Refresh last run date
      }
    } catch (error) {
      console.error("Error triggering auto invoices:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send invoices",
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getDayOptions = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const getSmartDateInfo = (day) => {
    if (day <= 28) return null;

    const months = {
      29: "February (non-leap years)",
      30: "February",
      31: "February, April, June, September, November",
    };

    return months[day] || null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Auto Invoice Settings
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    Automatically send monthly invoices to all customers
                  </CardDescription>
                </div>
                {hasChanges && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 ml-2"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Unsaved Changes</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {settings.auto_invoice_enabled ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-xl font-bold text-green-600">
                          Enabled
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                        <span className="text-xl font-bold text-gray-400">
                          Disabled
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Next Scheduled Run
                </p>
                <div className="mt-2">
                  <div className="text-lg font-bold">
                    {settings.auto_invoice_enabled
                      ? formatDate(nextInvoiceDate)
                      : "Not Scheduled"}
                  </div>
                  {lastRunDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last run: {formatDate(lastRunDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Enable Auto Invoicing</p>
                <p className="text-sm text-muted-foreground">
                  Automatically send invoices on scheduled date
                </p>
              </div>
            </div>
            <Switch
              checked={settings.auto_invoice_enabled}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, auto_invoice_enabled: checked });
                setHasChanges(true);
              }}
            />
          </div>

          {/* Schedule Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">
                Schedule Configuration
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Day of Month */}
                <div className="space-y-2">
                  <Label htmlFor="invoiceDay">Day of Month</Label>
                  <Select
                    value={String(settings.auto_invoice_day)}
                    onValueChange={(value) => {
                      setSettings({
                        ...settings,
                        auto_invoice_day: parseInt(value),
                      });
                      setHasChanges(true);
                    }}
                    disabled={!settings.auto_invoice_enabled}
                  >
                    <SelectTrigger id="invoiceDay">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {getDayOptions().map((day) => (
                        <SelectItem key={day} value={String(day)}>
                          {day}
                          {day === 1
                            ? "st"
                            : day === 2
                            ? "nd"
                            : day === 3
                            ? "rd"
                            : "th"}{" "}
                          of every month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {settings.auto_invoice_day > 28 &&
                  getSmartDateInfo(settings.auto_invoice_day) ? (
                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        Will automatically adjust to last day of month for:{" "}
                        {getSmartDateInfo(settings.auto_invoice_day)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {settings.auto_invoice_day > 28
                        ? "Smart adjustment: Works for all months"
                        : "Select any day (1-31), system adjusts for shorter months"}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="invoiceTime">Time</Label>
                  <Input
                    id="invoiceTime"
                    type="time"
                    value={settings.auto_invoice_time}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        auto_invoice_time: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    disabled={!settings.auto_invoice_enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Invoices will be sent at this time
                  </p>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Invoices will be generated for the previous month&apos;s
                    deliveries
                  </li>
                  <li>
                    Only customers with verified phone numbers will receive
                    invoices
                  </li>
                  <li>Invoices are sent automatically via WhatsApp</li>
                  <li>
                    Smart date adjustment: Days 29-31 automatically adjust to
                    the last day of shorter months
                  </li>
                  <li>
                    You can trigger manual sending anytime using the button
                    below
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Schedule Preview */}
          {settings.auto_invoice_enabled && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Schedule Preview
              </h4>
              <p className="text-sm text-muted-foreground">
                Invoices will be sent on the{" "}
                <strong className="text-foreground">
                  {settings.auto_invoice_day}
                  {settings.auto_invoice_day === 1
                    ? "st"
                    : settings.auto_invoice_day === 2
                    ? "nd"
                    : settings.auto_invoice_day === 3
                    ? "rd"
                    : "th"}
                </strong>{" "}
                of every month at{" "}
                <strong className="text-foreground">
                  {new Date(
                    `2000-01-01T${settings.auto_invoice_time}`
                  ).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </strong>
              </p>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSaveSettings}
              disabled={loading || !hasChanges}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>

            <Button
              onClick={handleTriggerNow}
              disabled={triggering}
              variant="outline"
              className="flex-1"
            >
              {triggering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invoices Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
