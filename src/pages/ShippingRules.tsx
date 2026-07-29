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
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Edit, MapPin, Plus, Search, SlidersHorizontal, Trash2, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ShippingStatus = "active" | "inactive";
type ShippingFilter = "all" | ShippingStatus;
type DeliveryEstimate = "same_day" | "next_day" | "within_2_days" | "within_3_5_days";

type ShippingForm = {
  id?: number;
  warehouseId: string;
  deliveryZoneId: string;
  name: string;
  code: string;
  description: string;
  charge: string;
  freeShippingThreshold: string;
  deliveryEstimate: DeliveryEstimate;
  status: ShippingStatus;
  isDefault: boolean;
};

type ShippingRow = {
  id: number;
  warehouseId: number | null;
  deliveryZoneId: number | null;
  name: string;
  code: string | null;
  description: string | null;
  charge: string;
  freeShippingThreshold: string | null;
  deliveryEstimate: DeliveryEstimate;
  status: ShippingStatus;
  isDefault: boolean;
  warehouseName: string | null;
  zoneName: string | null;
};

const emptyForm: ShippingForm = {
  warehouseId: "",
  deliveryZoneId: "",
  name: "",
  code: "",
  description: "",
  charge: "0",
  freeShippingThreshold: "",
  deliveryEstimate: "next_day",
  status: "active",
  isDefault: false,
};

const estimateLabels: Record<DeliveryEstimate, string> = {
  same_day: "Same day",
  next_day: "Next day",
  within_2_days: "Within 2 days",
  within_3_5_days: "3-5 days",
};

export default function ShippingRules() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ShippingFilter>("all");
  const [calculatorSubtotal, setCalculatorSubtotal] = useState("1000");
  const [calculatorState, setCalculatorState] = useState("Telangana");
  const [calculatorMethodId, setCalculatorMethodId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ShippingForm>(emptyForm);

  const methodsQuery = trpc.shipping.list.useQuery(
    { search: search.trim() || undefined, status: status === "all" ? undefined : status },
    { retry: false },
  );
  const statsQuery = trpc.shipping.stats.useQuery(undefined, { retry: false });
  const warehousesQuery = trpc.warehouse.list.useQuery({ status: "active" }, { retry: false });
  const zonesQuery = trpc.deliveryZone.list.useQuery({ isActive: true }, { retry: false });
  const calculationQuery = trpc.shipping.calculate.useQuery(
    {
      subtotal: Math.max(0, Number(calculatorSubtotal) || 0),
      state: calculatorState,
      shippingMethodId: calculatorMethodId ? Number(calculatorMethodId) : undefined,
    },
    { retry: false },
  );

  const methods = methodsQuery.data ?? [];
  const warehouses = warehousesQuery.data ?? [];
  const zones = zonesQuery.data ?? [];

  const afterChange = async (message: string) => {
    await Promise.all([
      utils.shipping.list.invalidate(),
      utils.shipping.stats.invalidate(),
      utils.shipping.calculate.invalidate(),
    ]);
    toast.success(message);
  };

  const createMethod = trpc.shipping.create.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Shipping method created.");
    },
    onError: (error) => toast.error(error.message || "Could not create shipping method."),
  });
  const updateMethod = trpc.shipping.update.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Shipping method updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update shipping method."),
  });
  const deleteMethod = trpc.shipping.delete.useMutation({
    onSuccess: () => afterChange("Shipping method disabled."),
    onError: (error) => toast.error(error.message || "Could not disable shipping method."),
  });

  function openCreate() {
    setForm({ ...emptyForm, isDefault: methods.length === 0 });
    setDialogOpen(true);
  }

  function openEdit(method: ShippingRow) {
    setForm({
      id: method.id,
      warehouseId: method.warehouseId ? String(method.warehouseId) : "",
      deliveryZoneId: method.deliveryZoneId ? String(method.deliveryZoneId) : "",
      name: method.name,
      code: method.code ?? "",
      description: method.description ?? "",
      charge: String(method.charge),
      freeShippingThreshold: method.freeShippingThreshold ? String(method.freeShippingThreshold) : "",
      deliveryEstimate: method.deliveryEstimate,
      status: method.status,
      isDefault: method.isDefault,
    });
    setDialogOpen(true);
  }

  function saveMethod() {
    if (!form.name.trim()) {
      toast.error("Shipping method name is required.");
      return;
    }
    const payload = {
      warehouseId: form.warehouseId ? Number(form.warehouseId) : undefined,
      deliveryZoneId: form.deliveryZoneId ? Number(form.deliveryZoneId) : undefined,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      charge: Math.max(0, Number(form.charge) || 0),
      freeShippingThreshold: form.freeShippingThreshold ? Math.max(0, Number(form.freeShippingThreshold) || 0) : undefined,
      deliveryEstimate: form.deliveryEstimate,
      status: form.status,
      isDefault: form.isDefault,
    };
    if (form.id) updateMethod.mutate({ id: form.id, ...payload });
    else createMethod.mutate(payload);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shipping Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure delivery methods, charges, warehouse routing, and zone estimates.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Method
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Methods" value={formatNumber(statsQuery.data?.total ?? 0)} loading={statsQuery.isLoading} icon={Truck} />
        <Metric label="Active" value={formatNumber(statsQuery.data?.active ?? 0)} loading={statsQuery.isLoading} icon={SlidersHorizontal} />
        <Metric label="Avg Charge" value={formatCurrency(statsQuery.data?.averageCharge ?? 0)} loading={statsQuery.isLoading} icon={Calculator} />
        <Metric label="Zones" value={formatNumber(zones.length)} loading={zonesQuery.isLoading} icon={MapPin} />
      </section>

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search methods, codes, zones, warehouses..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as ShippingFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-0">
            {methodsQuery.isLoading ? (
              <TableSkeleton />
            ) : methods.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Method</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Charge</TableHead>
                      <TableHead>Estimate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="pl-4">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-xs text-muted-foreground">{method.code ?? "No code"}</div>
                          {method.isDefault && <Badge variant="outline" className="mt-1 rounded-md">Default</Badge>}
                        </TableCell>
                        <TableCell>{method.zoneName ?? "All zones"}</TableCell>
                        <TableCell>{method.warehouseName ?? "Zone/default warehouse"}</TableCell>
                        <TableCell>
                          <div>{formatCurrency(method.charge)}</div>
                          <div className="text-xs text-muted-foreground">
                            {method.freeShippingThreshold ? `Free over ${formatCurrency(method.freeShippingThreshold)}` : "No free threshold"}
                          </div>
                        </TableCell>
                        <TableCell>{estimateLabels[method.deliveryEstimate]}</TableCell>
                        <TableCell>
                          <Badge className={method.status === "active" ? "rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200" : "rounded-md bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200"}>
                            {method.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(method)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMethod.mutate({ id: method.id })}>
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
              <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
                <Truck className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="font-semibold">No shipping methods configured</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Add a method so checkout can calculate delivery charges and estimates.
                </p>
                <Button className="mt-5" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="font-semibold">Shipping Calculator</h2>
              <p className="text-sm text-muted-foreground">Preview state-based charge and estimate.</p>
            </div>
            <Field label="Subtotal">
              <Input type="number" min={0} value={calculatorSubtotal} onChange={(event) => setCalculatorSubtotal(event.target.value)} />
            </Field>
            <Field label="State">
              <Select value={calculatorState} onValueChange={setCalculatorState}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Shipping Method">
              <Select value={calculatorMethodId || "default"} onValueChange={(value) => setCalculatorMethodId(value === "default" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Best/default method</SelectItem>
                  {methods.filter((method) => method.status === "active").map((method) => (
                    <SelectItem key={method.id} value={String(method.id)}>{method.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="rounded-md border p-4">
              <div className="flex justify-between text-sm">
                <span>Availability</span>
                <span>{calculationQuery.data?.available ? "Available" : "Not serviceable"}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Charge</span>
                <span>{formatCurrency(calculationQuery.data?.shippingAmount ?? 0)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Estimate</span>
                <span>{calculationQuery.data?.deliveryEstimate ? estimateLabels[calculationQuery.data.deliveryEstimate] : "Not set"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Shipping Method" : "Add Shipping Method"}</DialogTitle>
            <DialogDescription>
              Methods can apply to all zones or a specific delivery zone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Method Name" required><Input value={form.name} onChange={(event) => setFormValue("name", event.target.value)} /></Field>
            <Field label="Code"><Input value={form.code} onChange={(event) => setFormValue("code", event.target.value)} /></Field>
            <Field label="Warehouse">
              <Select value={form.warehouseId || "default"} onValueChange={(value) => setFormValue("warehouseId", value === "default" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Zone/default warehouse</SelectItem>
                  {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Delivery Zone">
              <Select value={form.deliveryZoneId || "all"} onValueChange={(value) => setFormValue("deliveryZoneId", value === "all" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All zones</SelectItem>
                  {zones.map((zone) => <SelectItem key={zone.id} value={String(zone.id)}>{zone.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Charge"><Input type="number" min={0} value={form.charge} onChange={(event) => setFormValue("charge", event.target.value)} /></Field>
            <Field label="Free Threshold"><Input type="number" min={0} value={form.freeShippingThreshold} onChange={(event) => setFormValue("freeShippingThreshold", event.target.value)} /></Field>
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
            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => setFormValue("status", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <Textarea value={form.description} onChange={(event) => setFormValue("description", event.target.value)} />
              </Field>
            </div>
            <label className="flex items-center justify-between rounded-md border p-3 text-sm md:col-span-2">
              <span>Default method</span>
              <Switch checked={form.isDefault} onCheckedChange={(checked) => setForm((current) => ({ ...current, isDefault: checked }))} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveMethod} disabled={createMethod.isPending || updateMethod.isPending}>Save Method</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function setFormValue(field: keyof ShippingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
}

function Metric({ label, value, loading, icon: Icon }: { label: string; value: string | number; loading: boolean; icon: typeof Truck }) {
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
