import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { trpc } from "@/providers/trpc";
import { getAppRole, getRoleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/i18n";
import { isValidIndianMobileNumber, normalizeFrontendMobileNumber } from "@/lib/utils";
import { indianStates } from "@/lib/freshflowData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { AlertCircle, Camera, KeyRound, Save, Trash2, Home, Briefcase, MapPin, Plus, Edit } from "lucide-react";

type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type ThemePreference = "system" | "light" | "dark";

type ProfileForm = {
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | "";
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  themePreference: ThemePreference;
};

const emptyForm: ProfileForm = {
  name: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  addressLine1: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  themePreference: "system",
};


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
              <Field label="Address Line 1" required><Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} placeholder="House/Flat No, Building Name" /></Field>
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
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    {address.addressType === "home" ? <Home className="h-4 w-4 text-muted-foreground" /> : address.addressType === "work" ? <Briefcase className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                    {address.fullName}
                  </div>
                  <span className="text-sm text-muted-foreground">{address.mobileNumber}</span>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  <br />
                  {address.areaLocality ? `${address.areaLocality}, ` : ""}{address.city}, {address.state} {address.postalCode}
                  {address.landmark ? <><br /><span className="text-xs opacity-75">Landmark: {address.landmark}</span></> : null}
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileQuery = trpc.profile.current.useQuery(undefined, { retry: false });
  const profile = profileQuery.data;

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      phone: profile.phone?.replace(/^\+91/, "") ?? "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: (profile.gender as Gender | null) ?? "",
      addressLine1: profile.addressLine1 ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "India",
      postalCode: profile.postalCode ?? "",
      themePreference: (profile.themePreference as ThemePreference | null) ?? "system",
    });
  }, [profile]);

  const originalForm = useMemo<ProfileForm>(() => {
    if (!profile) return emptyForm;
    return {
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: (profile.gender as Gender | null) ?? "",
      addressLine1: profile.addressLine1 ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "India",
      postalCode: profile.postalCode ?? "",
      themePreference: (profile.themePreference as ThemePreference | null) ?? "system",
    };
  }, [profile]);
  const dirty = JSON.stringify(form) !== JSON.stringify(originalForm);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: async (updated) => {
      await Promise.all([utils.profile.current.invalidate(), utils.auth.me.invalidate()]);
      setTheme(updated.themePreference ?? "system");
      toast.success("Profile updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update profile."),
  });

  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.profile.current.invalidate(), utils.auth.me.invalidate()]);
      toast.success("Profile photo updated.");
    },
    onError: (error) => toast.error(error.message || "Could not upload avatar."),
  });

  const deleteAvatar = trpc.profile.deleteAvatar.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.profile.current.invalidate(), utils.auth.me.invalidate()]);
      toast.success("Profile photo removed.");
    },
    onError: (error) => toast.error(error.message || "Could not remove avatar."),
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
    updateProfile.mutate({
      name: form.name.trim(),
      phone: form.phone ? normalizeFrontendMobileNumber(form.phone) : null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      addressLine1: form.addressLine1.trim() || null,
      city: form.city.trim() || null,
      state: form.state || null,
      country: form.country.trim() || null,
      postalCode: form.postalCode.trim() || null,
      themePreference: form.themePreference,
    });
  }

  function handleAvatarFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        uploadAvatar.mutate({ avatar: reader.result });
      }
    };
    reader.readAsDataURL(file);
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
            <AvatarImage src={profile.avatar ?? undefined} alt={profile.name ?? "Profile photo"} />
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => handleAvatarFile(event.target.files?.[0])}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadAvatar.isPending}>
              <Camera className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            {profile.avatar && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={deleteAvatar.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Photo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
                    <AlertDialogDescription>The default avatar will be displayed automatically.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAvatar.mutate()}>Remove Photo</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Email is read-only in Version 1.0.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={profile.email ?? ""} readOnly className="bg-muted/40" />
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
