import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Bell, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { Switch } from "@/Components/UI/shadcn-UI/switch";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { useState } from "react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { toast } from "react-toastify";

export default function SettingsNotificationsPage() {
  const [notifications, setNotifications] = useState({
    emailPayments: true,
    emailOrders: true,
    emailReports: false,
    smsPayments: true,
    smsOrders: false,
    whatsappPayments: true,
    whatsappOrders: true,
    whatsappReminders: true,
    pushNotifications: true,
  });

  const handleSave = () => {
    // TODO: Implement save to backend
    toast.success("Notification settings updated successfully", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Choose how you want to be notified
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                Email Notifications
              </h3>
            </div>
            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-payments" className="text-sm">
                  Payment confirmations
                </Label>
                <Switch
                  id="email-payments"
                  checked={notifications.emailPayments}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailPayments: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-orders" className="text-sm">
                  New orders
                </Label>
                <Switch
                  id="email-orders"
                  checked={notifications.emailOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailOrders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-reports" className="text-sm">
                  Daily reports
                </Label>
                <Switch
                  id="email-reports"
                  checked={notifications.emailReports}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailReports: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                SMS Notifications
              </h3>
            </div>
            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-payments" className="text-sm">
                  Payment confirmations
                </Label>
                <Switch
                  id="sms-payments"
                  checked={notifications.smsPayments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsPayments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-orders" className="text-sm">
                  New orders
                </Label>
                <Switch
                  id="sms-orders"
                  checked={notifications.smsOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsOrders: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-sm sm:text-base">
                WhatsApp Notifications
              </h3>
            </div>
            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-payments" className="text-sm">
                  Payment confirmations
                </Label>
                <Switch
                  id="whatsapp-payments"
                  checked={notifications.whatsappPayments}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      whatsappPayments: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-orders" className="text-sm">
                  New orders
                </Label>
                <Switch
                  id="whatsapp-orders"
                  checked={notifications.whatsappOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      whatsappOrders: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-reminders" className="text-sm">
                  Payment reminders
                </Label>
                <Switch
                  id="whatsapp-reminders"
                  checked={notifications.whatsappReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      whatsappReminders: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                Push Notifications
              </h3>
            </div>
            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Browser notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      pushNotifications: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
