import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { indianStates } from "@/lib/freshflowData";
import { formatCurrency, formatNumber } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Edit, MapPin, Plus, Search, Trash2, Truck, Warehouse } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DeliveryEstimate = "same_day" | "next_day" | "within_2_days" | "within_3_5_days";
type ZoneFilter = "all" | "active" | "inactive";

type ZoneForm = {
  id?: number;
  warehouseId: string;
  state: string;
  deliveryEstimate: DeliveryEstimate;
  deliveryFee: string;
  minimumOrderAmount: string;
  isActive: boolean;
};

type ZoneRow = {
  id: number;
  warehouseId: number | null;
  name: string;
  state: string;
  deliveryEstimate: DeliveryEstimate;
  deliveryFee: string;
  minimumOrderAmount: string;
  isActive: boolean;
  warehouseName: string | null;
};

const emptyForm: ZoneForm = {
  warehouseId: "",
  state: "Telangana",
  deliveryEstimate: "next_day",
  deliveryFee: "0",
  minimumOrderAmount: "0",
  isActive: true,
};

const estimateLabels: Record<DeliveryEstimate, string> = {
  same_day: "Same day",
  next_day: "Next day",
  within_2_days: "Within 2 days",
  within_3_5_days: "3-5 days",
};

export default function DeliveryZones() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ZoneFilter>("all");
  const [availabilityState, setAvailabilityState] = useState("Telangana");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ZoneForm>(emptyForm);

  const zonesQuery = trpc.deliveryZone.list.useQuery(
    {
      search: search.trim() || undefined,
      isActive: status === "all" ? undefined : status === "active",
    },
    { retry: false },
  );
  const statsQuery = trpc.deliveryZone.stats.useQuery(undefined, { retry: false });
  const warehousesQuery = trpc.warehouse.list.useQuery({ status: "active" }, { retry: false });
  const availabilityQuery = trpc.deliveryZone.availability.useQuery(
    { state: availabilityState },
    { retry: false },
  );

  const zones = zonesQuery.data ?? [];
  const warehouses = warehousesQuery.data ?? [];

  const afterChange = async (message: string) => {
    await Promise.all([
      utils.deliveryZone.list.invalidate(),
      utils.deliveryZone.stats.invalidate(),
      utils.deliveryZone.availability.invalidate(),
      utils.shipping.calculate.invalidate(),
    ]);
    toast.success(message);
  };

  const createZone = trpc.deliveryZone.create.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Delivery state enabled.");
    },
    onError: (error) => toast.error(error.message || "Could not save delivery state."),
  });
  const updateZone = trpc.deliveryZone.update.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Delivery state updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update delivery state."),
  });
  const deleteZone = trpc.deliveryZone.delete.useMutation({
    onSuccess: () => afterChange("Delivery state disabled."),
    onError: (error) => toast.error(error.message || "Could not disable delivery state."),
  });

  function openCreate() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(zone: ZoneRow) {
    setForm({
      id: zone.id,
      warehouseId: zone.warehouseId ? String(zone.warehouseId) : "",
      state: zone.state,
      deliveryEstimate: zone.deliveryEstimate,
      deliveryFee: String(zone.deliveryFee ?? "0"),
      minimumOrderAmount: String(zone.minimumOrderAmount ?? "0"),
      isActive: zone.isActive,
    });
    setDialogOpen(true);
  }

  function saveZone() {
    if (!form.state.trim()) {
      toast.error("State is required.");
      return;
    }
    const payload = {
      warehouseId: form.warehouseId ? Number(form.warehouseId) : undefined,
      state: form.state.trim(),
      deliveryEstimate: form.deliveryEstimate,
      deliveryFee: Math.max(0, Number(form.deliveryFee) || 0),
      minimumOrderAmount: Math.max(0, Number(form.minimumOrderAmount) || 0),
      isActive: form.isActive,
    };
    if (form.id) {
      updateZone.mutate({ id: form.id, ...payload });
    } else {
      createZone.mutate(payload);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Delivery Zones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enable or disable delivery by State and link each State to a warehouse.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add State
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total States" value={formatNumber(statsQuery.data?.total ?? 0)} loading={statsQuery.isLoading} icon={MapPin} />
        <Metric label="Enabled States" value={formatNumber(statsQuery.data?.active ?? 0)} loading={statsQuery.isLoading} icon={CheckCircle2} />
        <Metric label="Mapped States" value={formatNumber(statsQuery.data?.states ?? 0)} loading={statsQuery.isLoading} icon={Truck} />
        <Metric label="Warehouses" value={formatNumber(warehouses.length)} loading={warehousesQuery.isLoading} icon={Warehouse} />
      </section>

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_190px_280px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search state or warehouse..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as ZoneFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="active">Enabled</SelectItem>
              <SelectItem value="inactive">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Select value={availabilityState} onValueChange={setAvailabilityState}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="mt-2 text-xs text-muted-foreground">
              {availabilityQuery.isLoading
                ? "Checking..."
                : availabilityQuery.data?.available
                  ? `Delivery enabled in ${availabilityQuery.data.zone?.state}`
                  : "Delivery disabled"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {zonesQuery.isLoading ? (
            <TableSkeleton />
          ) : zones.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">State</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="pl-4">
                        <div className="font-medium">{zone.state}</div>
                        <div className="text-xs text-muted-foreground">{zone.name}</div>
                      </TableCell>
                      <TableCell>{zone.warehouseName ?? "Any active warehouse"}</TableCell>
                      <TableCell>{estimateLabels[zone.deliveryEstimate]}</TableCell>
                      <TableCell>
                        <div>{formatCurrency(zone.deliveryFee)}</div>
                        <div className="text-xs text-muted-foreground">Min {formatCurrency(zone.minimumOrderAmount)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={zone.isActive ? "rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200" : "rounded-md bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200"}>
                          {zone.isActive ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(zone)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteZone.mutate({ id: zone.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-semibold">No delivery states configured</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Enable delivery for each State where the marketplace can fulfil orders.
              </p>
              <Button className="mt-5" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add State
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Delivery State" : "Add Delivery State"}</DialogTitle>
            <DialogDescription>
              Delivery availability is determined only by the selected State.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="State" required>
              <Select value={form.state} onValueChange={(state) => setForm((current) => ({ ...current, state }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Warehouse">
              <Select value={form.warehouseId || "any"} onValueChange={(value) => setFormValue("warehouseId", value === "any" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any active warehouse</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Delivery Estimate">
              <Select value={form.deliveryEstimate} onValueChange={(value) => setFormValue("deliveryEstimate", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="same_day">Same day</SelectItem>
                  <SelectItem value="next_day">Next day</SelectItem>
                  <SelectItem value="within_2_days">Within 2 days</SelectItem>
                  <SelectItem value="within_3_5_days">3-5 days</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Delivery Fee">
              <Input type="number" min={0} value={form.deliveryFee} onChange={(event) => setFormValue("deliveryFee", event.target.value)} />
            </Field>
            <Field label="Minimum Order">
              <Input type="number" min={0} value={form.minimumOrderAmount} onChange={(event) => setFormValue("minimumOrderAmount", event.target.value)} />
            </Field>
            <label className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>Delivery enabled</span>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveZone} disabled={createZone.isPending || updateZone.isPending}>
              Save State
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function setFormValue(field: keyof ZoneForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
}

function Metric({ label, value, loading, icon: Icon }: { label: string; value: string | number; loading: boolean; icon: typeof MapPin }) {
  return (
    <Card>
      <CardContent className="flex min-h-[104px] items-start justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-3 h-8 w-20" /> : <p className="mt-2 text-2xl font-semibold">{value}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="ml-1 text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
