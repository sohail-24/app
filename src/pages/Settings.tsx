import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Globe,
  Shield,
  Save,
  Check,
} from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    lowStockAlerts: true,
    darkMode: false,
    language: "en",
    currency: "USD",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) =>
                setSettings({ ...settings, emailNotifications: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-xs text-muted-foreground">Get notified about order status changes</p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={(v) =>
                setSettings({ ...settings, orderUpdates: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Stock Alerts</Label>
              <p className="text-xs text-muted-foreground">Warn when inventory is running low</p>
            </div>
            <Switch
              checked={settings.lowStockAlerts}
              onCheckedChange={(v) =>
                setSettings({ ...settings, lowStockAlerts: v })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </CardTitle>
          <CardDescription>Regional and display settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Toggle dark theme</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) =>
                setSettings({ ...settings, darkMode: v })
              }
            />
          </div>
          <Separator />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(v) =>
                  setSettings({ ...settings, language: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) =>
                  setSettings({ ...settings, currency: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                  <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </CardTitle>
          <CardDescription>Account security options</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Authentication uses secure FreshFlow sessions with email/password and mobile OTP sign-in.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className={saved ? "bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"}
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
