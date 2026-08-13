import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { trpc } from "@/providers/trpc";
import { getAppRole, getRoleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/i18n";
import { isValidIndianMobileNumber, normalizeFrontendMobileNumber } from "@/lib/utils";
import { indianStates } from "@/lib/freshflowData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Check, KeyRound, Save, Trash2, Home, Briefcase, MapPin, Plus, Edit } from "lucide-react";

type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type ThemePreference = "system" | "light" | "dark";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | "";
  themePreference: ThemePreference;
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  themePreference: "system",
};

// Bump this when the local avatar artwork changes. The database keeps the clean
// path while the browser receives a new URL and cannot reuse an old PNG cache.
const AVATAR_ASSET_VERSION = "2";

function avatarImageUrl(path: string | null | undefined) {
  return path ? `${path}?v=${AVATAR_ASSET_VERSION}` : undefined;
}


function AddressBook() {
  const utils = trpc.useUtils();
  const addressQuery = trpc.address.list.useQuery();
  const addresses = addressQuery.data || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const defaultForm = {
    fullName: "",
    mobileNumber: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    areaLocality: "",
    city: "",
    state: "Telangana",
    postalCode: "",
    country: "India",
    addressType: "home" as "home" | "work" | "other",
    isDefault: false,
  };
  const [form, setForm] = useState(defaultForm);

  const createMutation = trpc.address.create.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      setIsDialogOpen(false);
      toast.success("Address added successfully.");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.address.update.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      setIsDialogOpen(false);
      toast.success("Address updated successfully.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.address.delete.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      toast.success("Address deleted.");
    },
  });

  const setDefaultMutation = trpc.address.setDefault.useMutation({
    onSuccess: () => {
      utils.address.list.invalidate();
      toast.success("Default address updated.");
    },
  });

  function handleOpenForm(address?: any) {
    if (address) {
      setEditingAddress(address);
      setForm({ ...address });
    } else {
      setEditingAddress(null);
      setForm({ ...defaultForm, isDefault: addresses.length === 0 });
    }
    setIsDialogOpen(true);
  }

  function handleSave() {
    if (!form.fullName || !form.mobileNumber || !form.addressLine1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const trimmedAddress = form.addressLine1.trim();
    if (trimmedAddress.length < 10 || trimmedAddress.length > 300) {
      toast.error("Please enter a complete street address (minimum 10 characters).");
      return;
    }

    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  if (addressQuery.isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Address Book</CardTitle>
          <CardDescription>Manage your delivery addresses.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" required><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
                <Field label="Mobile Number" required><Input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} placeholder="10 digits" /></Field>
              </div>
              <Field label="House / Flat No. & Street Address" required><Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} placeholder="House/Flat No, Building Name" /></Field>
              <Field label="Address Line 2 (Optional)"><Input value={form.addressLine2 || ""} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} placeholder="Street, Sector, Village" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Landmark (Optional)"><Input value={form.landmark || ""} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="e.g. Near Apollo Hospital" /></Field>
                <Field label="Area / Locality"><Input value={form.areaLocality || ""} onChange={(e) => setForm({ ...form, areaLocality: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                <Field label="State" required>
                  <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal Code" required><Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></Field>
                <Field label="Address Type">
                  <Select value={form.addressType} onValueChange={(v: any) => setForm({ ...form, addressType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              {!editingAddress && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="isDefault" checked={form.isDefault} onCheckedChange={(checked) => setForm({ ...form, isDefault: !!checked })} />
                  <label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Make this my default address
                  </label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingAddress ? "Save Changes" : "Save Address"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {addresses.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            <MapPin className="mx-auto mb-2 h-8 w-8 opacity-20" />
            <p>No addresses saved yet.</p>
          </div>
        ) : (
          addresses.map((address: any) => (
            <div key={address.id} className={`relative flex flex-col justify-between rounded-lg border p-4 shadow-sm ${address.isDefault ? 'border-primary bg-primary/5' : ''}`}>
              {address.isDefault && (
                <Badge variant="default" className="absolute -top-2.5 -right-2.5 shadow-sm">Default</Badge>
              )}
              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 font-medium">
                    {address.addressType === "home" ? <Home className="h-4 w-4 text-muted-foreground" /> : address.addressType === "work" ? <Briefcase className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                    {address.fullName}
                  </div>
                  <div className="text-sm text-muted-foreground">{address.mobileNumber?.replace(/^\+91/, "")}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{address.addressLine1}</div>
                  {address.addressLine2 && <div>{address.addressLine2}</div>}
                  {address.landmark && <div>Near {address.landmark.replace(/^Near /i, "")}</div>}
                  {address.areaLocality && <div>{address.areaLocality}</div>}
                  <div>{address.city}, {address.state}{address.postalCode ? ` - ${address.postalCode}` : ""}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="secondary" size="sm" className="h-8 flex-1" onClick={() => handleOpenForm(address)}>
                  <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                </Button>
                {!address.isDefault && (
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setDefaultMutation.mutate({ id: address.id })} disabled={setDefaultMutation.isPending}>
                    Set Default
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                  if (confirm("Delete this address?")) deleteMutation.mutate({ id: address.id });
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}


export default function Profile() {
  const utils = trpc.useUtils();
  const { setTheme } = useTheme();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileQuery = trpc.profile.current.useQuery(undefined, { retry: false });
  const avatarQuery = trpc.profile.avatars.useQuery(undefined, { retry: false });
  const profile = profileQuery.data;

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      email: profile.email ?? "",
      phone: profile.phone?.replace(/^\+91/, "") ?? "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: (profile.gender as Gender | null) ?? "",
      themePreference: (profile.themePreference as ThemePreference | null) ?? "system",
    });
  }, [profile]);

  const originalForm = useMemo<ProfileForm>(() => {
    if (!profile) return emptyForm;
    return {
      name: profile.name ?? "",
      email: profile.email ?? "",
      phone: profile.phone?.replace(/^\+91/, "") ?? "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: (profile.gender as Gender | null) ?? "",
      themePreference: (profile.themePreference as ThemePreference | null) ?? "system",
    };
  }, [profile]);
  const dirty = JSON.stringify(form) !== JSON.stringify(originalForm);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: async (updated) => {
      utils.profile.current.setData(undefined, updated);
      await Promise.all([utils.profile.current.invalidate(), utils.auth.me.invalidate()]);
      setTheme(updated.themePreference ?? "system");
      toast.success("Profile updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update profile."),
  });

  const changePassword = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated.");
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => toast.error(error.message || "Could not update password."),
  });

  if (profileQuery.isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile || profileQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load your profile</AlertTitle>
          <AlertDescription>{profileQuery.error?.message ?? "Please try again."}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => profileQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  const initials = (profile.name ?? profile.email ?? "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function saveProfile() {
    if (form.phone && !isValidIndianMobileNumber(form.phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const email = form.email.trim();
    if (profile.email === null && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    updateProfile.mutate({
      name: form.name.trim(),
      ...(profile.email === null && email ? { email } : {}),
      phone: form.phone ? normalizeFrontendMobileNumber(form.phone) : null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      themePreference: form.themePreference,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
      <section>
        <p className="text-sm text-muted-foreground">Account / Profile</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">User Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal account information.</p>
      </section>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={avatarImageUrl(profile.avatar)} alt={profile.name ?? "Profile photo"} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">{profile.name || "User"}</h2>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="secondary" className="rounded-md">{getRoleLabel(getAppRole(profile))}</Badge>
              <Badge variant="outline" className="rounded-md">{profile.email ?? "No email"}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={updateProfile.isPending || avatarQuery.isLoading}>
                  Choose Avatar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md md:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Choose Avatar</DialogTitle>
                  <DialogDescription>Select an avatar for your profile.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-4 md:grid-cols-5">
                  <button
                    type="button"
                    className={`flex flex-col items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-accent ${profile.avatar === null ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => {
                      updateProfile.mutate({ avatar: null });
                      setAvatarDialogOpen(false);
                    }}
                    disabled={updateProfile.isPending}
                  >
                    <Avatar className="h-14 w-14 border">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      {profile.avatar === null && <Check className="h-3.5 w-3.5" />}
                      Default
                    </span>
                  </button>
                  {(avatarQuery.data ?? []).map((avatarPath) => (
                    <button
                      type="button"
                      key={avatarPath}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-accent ${profile.avatar === avatarPath ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => {
                        updateProfile.mutate({ avatar: avatarPath });
                        setAvatarDialogOpen(false);
                      }}
                      disabled={updateProfile.isPending}
                    >
                      <Avatar className="h-14 w-14 border">
                        <AvatarImage src={avatarImageUrl(avatarPath)} alt={formatAvatarName(avatarPath)} />
                        <AvatarFallback>{formatAvatarName(avatarPath).slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="flex items-center gap-1 text-xs font-medium">
                        {profile.avatar === avatarPath && <Check className="h-3.5 w-3.5" />}
                        {formatAvatarName(avatarPath)}
                      </span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>{profile.email !== null ? "Email cannot be changed once it is set." : "Add an email address to your account."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                readOnly={profile.email !== null}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder={profile.email === null ? "you@example.com" : undefined}
                className={profile.email !== null ? "bg-muted/40" : undefined}
              />
            </Field>
            <Field label="Mobile Number">
              <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="98765 43210" />
            </Field>
            <Field label="Date of Birth">
              <Input type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
            </Field>
            <Field label="Gender">
              <Select value={form.gender || "unset"} onValueChange={(value) => setForm({ ...form, gender: value === "unset" ? "" : value as Gender })}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Not set</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <AddressBook />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>Review account dates and update your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReadOnly label="Last Login" value={formatDate(profile.lastSignInAt)} />
            <ReadOnly label="Account Created" value={formatDate(profile.createdAt)} />
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Enter your current password before choosing a new one.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Field label="Current Password" required>
                    <Input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
                  </Field>
                  <Field label="New Password" required>
                    <Input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
                  </Field>
                  <Field label="Confirm Password" required>
                    <Input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} />
                  </Field>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
                  <Button onClick={() => changePassword.mutate(passwordForm)} disabled={changePassword.isPending}>
                    Update Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
            <CardDescription>Personal display preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={form.themePreference}
              onValueChange={(value) => setForm({ ...form, themePreference: value as ThemePreference })}
              className="grid gap-3 sm:grid-cols-3"
            >
              {(["system", "light", "dark"] as ThemePreference[]).map((theme) => (
                <Label key={theme} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 capitalize">
                  <RadioGroupItem value={theme} />
                  {theme}
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </section>

      <Card className="sticky bottom-3 z-10 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={!dirty || updateProfile.isPending} onClick={() => setForm(originalForm)}>
            Cancel
          </Button>
          <Button disabled={!dirty || updateProfile.isPending} onClick={saveProfile}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function formatAvatarName(path: string) {
  return (path.split("/").pop() ?? "Avatar")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-40" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
