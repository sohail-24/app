import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_CURRENCY } from "@/lib/i18n";
import { getAppRole, getRoleLabel } from "@/lib/roles";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Building2,
  Check,
  Globe2,
  Languages,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
} from "lucide-react";

const SETTINGS_KEY = "freshflow-workspace-settings";

type WorkspaceSettings = {
  theme: "light" | "dark" | "system";
  currency: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  orderUpdates: boolean;
  lowStockAlerts: boolean;
  securityAlerts: boolean;
  businessDisplayName: string;
  gstin: string;
  address: string;
};

const defaultSettings: WorkspaceSettings = {
  theme: "system",
  currency: DEFAULT_CURRENCY,
  language: "en-IN",
  timezone: "Asia/Kolkata",
  emailNotifications: true,
  orderUpdates: true,
  lowStockAlerts: true,
  securityAlerts: true,
  businessDisplayName: "",
  gstin: "",
  address: "",
};

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const companyQuery = trpc.company.byId.useQuery(
    { id: user?.companyId ?? 0 },
    { enabled: !!user?.companyId, retry: false },
  );
  const company = companyQuery.data ?? null;
  const role = getAppRole(user);
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (company?.name && !settings.businessDisplayName) {
      setSettings((current) => ({ ...current, businessDisplayName: company.name }));
    }
  }, [company?.name, settings.businessDisplayName]);

  const update = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    if (key === "theme") setTheme(String(value));
  };

  const save = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    toast.success("Workspace settings saved.");
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1250px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-md">{getRoleLabel(role)}</Badge>
            <Badge variant="outline" className="rounded-md">INR default</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure business branding, theme, localization, notifications, security, and regional defaults.
          </p>
        </div>
        <Button onClick={save}>
          {saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Business Name">
                <Input
                  value={settings.businessDisplayName}
                  onChange={(event) => update("businessDisplayName", event.target.value)}
                  placeholder="FreshFlow Traders"
                />
              </Field>
              <Field label="GSTIN / Tax ID">
                <Input value={settings.gstin} onChange={(event) => update("gstin", event.target.value)} placeholder="27ABCDE1234F1Z5" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Business Address">
                  <Textarea
                    value={settings.address}
                    onChange={(event) => update("address", event.target.value)}
                    placeholder="Warehouse, market yard, city, state, PIN code"
                    className="min-h-24"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Palette },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => update("theme", option.value as WorkspaceSettings["theme"])}
                  className={`rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                    (theme ?? settings.theme) === option.value ? "border-primary bg-primary/5" : "bg-card"
                  }`}
                >
                  <option.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.value === "system" ? "Follow device preference" : `${option.label} interface`}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe2 className="h-4 w-4" />
                Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Currency">
                <Select value={settings.currency} onValueChange={(value) => update("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Language">
                <Select value={settings.language} onValueChange={(value) => update("language", value)}>
                  <SelectTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-IN">English (India)</SelectItem>
                    <SelectItem value="hi-IN">Hindi</SelectItem>
                    <SelectItem value="ta-IN">Tamil</SelectItem>
                    <SelectItem value="te-IN">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Timezone">
                <Select value={settings.timezone} onValueChange={(value) => update("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Email notifications" description="Receive business updates via email." checked={settings.emailNotifications} onCheckedChange={(value) => update("emailNotifications", value)} />
              <Separator />
              <ToggleRow label="Order updates" description="Notify when purchase orders change state." checked={settings.orderUpdates} onCheckedChange={(value) => update("orderUpdates", value)} />
              <Separator />
              <ToggleRow label="Low-stock alerts" description="Warn when inventory drops below reorder levels." checked={settings.lowStockAlerts} onCheckedChange={(value) => update("lowStockAlerts", value)} />
              <Separator />
              <ToggleRow label="Security alerts" description="Notify owners about sign-ins and sensitive changes." checked={settings.securityAlerts} onCheckedChange={(value) => update("securityAlerts", value)} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Summary label="Business" value={settings.businessDisplayName || company?.name || "FreshFlow"} />
              <Summary label="Role" value={getRoleLabel(role)} />
              <Summary label="Currency" value={settings.currency} />
              <Summary label="Timezone" value={settings.timezone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secure session authentication</p>
                    <p className="text-xs text-muted-foreground">FreshFlow uses JWT-backed sessions with email/password and mobile OTP support.</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Review Security Settings
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label>{label}</Label>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
