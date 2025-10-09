import { useState } from "react";
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
import { Textarea } from "@/Components/UI/shadcn-UI/textarea";
import { Switch } from "@/Components/UI/shadcn-UI/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/Components/UI/shadcn-UI/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Separator } from "@/Components/UI/shadcn-UI/separator";
import {
  Settings,
  Save,
  RefreshCw,
  Mail,
  MessageSquare,
  CreditCard,
  Database,
  Shield,
  Bell,
  Globe,
  Key,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Badge } from "@/Components/UI/shadcn-UI/badge";

export default function SystemSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    appName: "Dhandha Management System",
    appUrl: "https://dhandha.com",
    supportEmail: "paaniwale7@gmail.com",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    language: "en",
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "paaniwale7@gmail.com",
    smtpPassword: "",
    fromEmail: "paaniwale7@gmail.com",
    fromName: "Dhandha Team",
    enableEmailNotifications: true,
  });

  // WhatsApp Settings
  const [whatsappSettings, setWhatsappSettings] = useState({
    apiKey: "",
    phoneNumber: "",
    businessName: "Dhandha Business",
    enableWhatsApp: true,
    welcomeMessage: "Welcome to Dhandha! How can we help you today?",
    autoReplyEnabled: true,
  });

  // Razorpay Settings
  const [razorpaySettings, setRazorpaySettings] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    enablePayments: true,
    testMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requireStrongPassword: true,
    enableIpWhitelist: false,
    ipWhitelist: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    whatsappNotifications: true,
    orderNotifications: true,
    paymentNotifications: true,
    lowStockNotifications: false,
    dailyReports: true,
    weeklyReports: true,
  });

  // Database Settings
  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30",
    lastBackup: new Date().toISOString(),
  });

  const handleSaveSettings = async (section) => {
    try {
      setLoading(true);
      // In real app, call API to save settings
      // await saveSettings(section, settings);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Success",
        description: `${section} settings saved successfully`,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (type) => {
    try {
      setLoading(true);
      // Test connection based on type (email, whatsapp, razorpay)
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate test

      toast({
        title: "Success",
        description: `${type} connection test successful`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `${type} connection test failed`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      // Trigger manual backup
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate backup

      setDatabaseSettings({
        ...databaseSettings,
        lastBackup: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Database backup completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Backup failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure application settings and integrations
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Application Settings</CardTitle>
              <CardDescription>
                Configure basic application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={generalSettings.appName}
                    onChange={(e) => {
                      setGeneralSettings({
                        ...generalSettings,
                        appName: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appUrl">Application URL</Label>
                  <Input
                    id="appUrl"
                    value={generalSettings.appUrl}
                    onChange={(e) => {
                      setGeneralSettings({
                        ...generalSettings,
                        appUrl: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => {
                      setGeneralSettings({
                        ...generalSettings,
                        supportEmail: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => {
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: value,
                      });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        Asia/Kolkata (IST)
                      </SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">
                        America/New York (EST)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London (GMT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(value) => {
                      setGeneralSettings({
                        ...generalSettings,
                        dateFormat: value,
                      });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) => {
                      setGeneralSettings({
                        ...generalSettings,
                        currency: value,
                      });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setHasChanges(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSettings("General")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable email notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailSettings({
                      ...emailSettings,
                      enableEmailNotifications: checked,
                    });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        smtpHost: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        smtpPort: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        smtpUser: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        smtpPassword: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        fromEmail: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        fromName: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection("Email")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveSettings("Email")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Configuration</CardTitle>
              <CardDescription>
                Configure WhatsApp Business API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">WhatsApp Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Enable WhatsApp notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={whatsappSettings.enableWhatsApp}
                  onCheckedChange={(checked) => {
                    setWhatsappSettings({
                      ...whatsappSettings,
                      enableWhatsApp: checked,
                    });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappApiKey">API Key</Label>
                  <Input
                    id="whatsappApiKey"
                    type="password"
                    value={whatsappSettings.apiKey}
                    onChange={(e) => {
                      setWhatsappSettings({
                        ...whatsappSettings,
                        apiKey: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    placeholder="Enter WhatsApp API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappPhone">Business Phone Number</Label>
                  <Input
                    id="whatsappPhone"
                    value={whatsappSettings.phoneNumber}
                    onChange={(e) => {
                      setWhatsappSettings({
                        ...whatsappSettings,
                        phoneNumber: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={whatsappSettings.businessName}
                    onChange={(e) => {
                      setWhatsappSettings({
                        ...whatsappSettings,
                        businessName: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={whatsappSettings.welcomeMessage}
                    onChange={(e) => {
                      setWhatsappSettings({
                        ...whatsappSettings,
                        welcomeMessage: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoReply">Enable Auto-Reply</Label>
                  <Switch
                    id="autoReply"
                    checked={whatsappSettings.autoReplyEnabled}
                    onCheckedChange={(checked) => {
                      setWhatsappSettings({
                        ...whatsappSettings,
                        autoReplyEnabled: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection("WhatsApp")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveSettings("WhatsApp")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configuration</CardTitle>
              <CardDescription>
                Configure Razorpay payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Payment Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable online payments
                    </p>
                  </div>
                </div>
                <Switch
                  checked={razorpaySettings.enablePayments}
                  onCheckedChange={(checked) => {
                    setRazorpaySettings({
                      ...razorpaySettings,
                      enablePayments: checked,
                    });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                  <Input
                    id="razorpayKeyId"
                    value={razorpaySettings.keyId}
                    onChange={(e) => {
                      setRazorpaySettings({
                        ...razorpaySettings,
                        keyId: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    placeholder="rzp_XXXXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                  <Input
                    id="razorpayKeySecret"
                    type="password"
                    value={razorpaySettings.keySecret}
                    onChange={(e) => {
                      setRazorpaySettings({
                        ...razorpaySettings,
                        keySecret: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    placeholder="Enter secret key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={razorpaySettings.webhookSecret}
                    onChange={(e) => {
                      setRazorpaySettings({
                        ...razorpaySettings,
                        webhookSecret: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    placeholder="Enter webhook secret"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="testMode">Test Mode</Label>
                  <Switch
                    id="testMode"
                    checked={razorpaySettings.testMode}
                    onCheckedChange={(checked) => {
                      setRazorpaySettings({
                        ...razorpaySettings,
                        testMode: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection("Razorpay")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveSettings("Payment")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) => {
                      setSecuritySettings({
                        ...securitySettings,
                        enableTwoFactor: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Strong Password Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce strong password policy
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireStrongPassword}
                    onCheckedChange={(checked) => {
                      setSecuritySettings({
                        ...securitySettings,
                        requireStrongPassword: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict access by IP address
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableIpWhitelist}
                    onCheckedChange={(checked) => {
                      setSecuritySettings({
                        ...securitySettings,
                        enableIpWhitelist: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => {
                      setSecuritySettings({
                        ...securitySettings,
                        maxLoginAttempts: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => {
                      setSecuritySettings({
                        ...securitySettings,
                        passwordMinLength: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {securitySettings.enableIpWhitelist && (
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">
                    Allowed IP Addresses (comma-separated)
                  </Label>
                  <Textarea
                    id="ipWhitelist"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => {
                      setSecuritySettings({
                        ...securitySettings,
                        ipWhitelist: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    placeholder="192.168.1.1, 10.0.0.1"
                    rows={3}
                  />
                </div>
              )}

              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setHasChanges(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSettings("Security")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure notification channels and types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive WhatsApp notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsappNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        whatsappNotifications: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new orders
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        orderNotifications: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about payments
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        paymentNotifications: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily summary reports
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        dailyReports: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly summary reports
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        weeklyReports: checked,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setHasChanges(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSettings("Notifications")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Backup and maintenance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Automatic Backups</p>
                    <p className="text-sm text-muted-foreground">
                      Enable scheduled database backups
                    </p>
                  </div>
                </div>
                <Switch
                  checked={databaseSettings.autoBackup}
                  onCheckedChange={(checked) => {
                    setDatabaseSettings({
                      ...databaseSettings,
                      autoBackup: checked,
                    });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={databaseSettings.backupFrequency}
                    onValueChange={(value) => {
                      setDatabaseSettings({
                        ...databaseSettings,
                        backupFrequency: value,
                      });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">
                    Retention Period (days)
                  </Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={databaseSettings.backupRetention}
                    onChange={(e) => {
                      setDatabaseSettings({
                        ...databaseSettings,
                        backupRetention: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Backup:</span>
                  <span className="text-sm">
                    {new Date(databaseSettings.lastBackup).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Backup:</span>
                  <span className="text-sm">
                    {new Date(
                      Date.parse(databaseSettings.lastBackup) +
                        24 * 60 * 60 * 1000
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackupNow}
                  disabled={loading}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Backup Now
                </Button>
                <Button
                  onClick={() => handleSaveSettings("Database")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
