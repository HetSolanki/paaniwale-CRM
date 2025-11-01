import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Shield, Lock, Key, AlertTriangle, Monitor } from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { useState } from "react";
import { toast } from "react-toastify";
import { Switch } from "@/Components/UI/shadcn-UI/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // show error under confirmPassword field
  });
export default function SettingsSecurityPage() {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const handleChangePassword = (e) => {
    e.preventDefault();
    // TODO: Implement password change
    toast.success("Password updated successfully", {
      position: "bottom-right",
      autoClose: 2000,
    });
    form.reset();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Change Password Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-100 dark:from-red-950/50 dark:to-orange-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Manage your account security
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Change Password Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                Change Password
              </h3>
            </div>
            <form
              onSubmit={form.handleSubmit(handleChangePassword)}
              className="space-y-4 ml-0 sm:ml-7"
            >
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  {...form.register("currentPassword")}
                  placeholder="Enter current password"
                />
                {form.formState.errors.currentPassword && (
                  <p style={{ color: "red" }}>
                    {form.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  {...form.register("newPassword")}
                  placeholder="Enter new password"
                />
                {form.formState.errors.newPassword && (
                  <p style={{ color: "red" }}>
                    {form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  {...form.register("confirmPassword")}
                  placeholder="Confirm new password"
                />
                {form.formState.errors.confirmPassword && (
                  <p style={{ color: "red" }}>
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Update Password
              </Button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                Two-Factor Authentication
              </h3>
            </div>
            <div className="ml-0 sm:ml-7 space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="2fa" className="text-sm font-medium">
                    Enable 2FA
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>
              {twoFactorAuth && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    📱 Scan the QR code with your authenticator app to complete
                    setup
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Setup 2FA
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Login Alerts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                Login Alerts
              </h3>
            </div>
            <div className="ml-0 sm:ml-7">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="login-alerts" className="text-sm font-medium">
                    Email on new login
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">
                Active Sessions
              </h3>
            </div>
            <div className="ml-0 sm:ml-7 space-y-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Windows • Chrome • Mumbai, India
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
              >
                Sign Out All Devices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
