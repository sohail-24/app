import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatDate, formatNumber } from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  
  Edit,
  History,
  Package,
  Save,
  Search,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WarehouseStatus = "active" | "inactive";
type StockStatus = "all" | "in_stock" | "low_stock" | "out_of_stock";
type MovementType = "receive" | "dispatch";

type WarehouseForm = {
  id?: number;
  name: string;
  code: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  capacityUnits: string;
  usedCapacityUnits: string;
  isDefault: boolean;
  contactPerson: string;
  contactNumber: string;
  status: WarehouseStatus;
};

type MovementForm = {
  productId: string;
  quantity: string;
  supplierName: string;
  reference: string;
  orderId: string;
  notes: string;
};

const emptyWarehouseForm: WarehouseForm = {
  name: "Main Warehouse",
  code: "WH-001",
  description: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  capacityUnits: "0",
  usedCapacityUnits: "0",
  isDefault: true,
  contactPerson: "",
  contactNumber: "",
  status: "active",
};

const emptyMovementForm: MovementForm = {
  productId: "",
  quantity: "",
  supplierName: "",
  reference: "",
  orderId: "",
  notes: "",
};

const stockStatusLabels: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export default function Warehouse() {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState<WarehouseForm>(emptyWarehouseForm);
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("all");
  const [movementType, setMovementType] = useState<MovementType | "all">("all");
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);

  const warehouseQuery = trpc.warehouse.get.useQuery(undefined, { retry: false });
  const warehouseListQuery = trpc.warehouse.list.useQuery(undefined, { retry: false });
  const statsQuery = trpc.warehouse.stats.useQuery(undefined, { retry: false });
  const stockQuery = trpc.warehouse.stock.useQuery(
    {
      search: search.trim() || undefined,
      status: stockStatus === "all" ? undefined : stockStatus,
    },
    { retry: false },
  );
  const movementsQuery = trpc.warehouse.movements.useQuery(
    {
      type: movementType === "all" ? undefined : movementType,
      limit: 50,
    },
    { retry: false },
  );

  const warehouse = warehouseQuery.data ?? null;
  const stock = stockQuery.data ?? [];
  const movements = movementsQuery.data ?? [];
  const warehouseList = warehouseListQuery.data ?? [];
  const warehouseMissing = warehouseQuery.error?.data?.code === "NOT_FOUND";

  const productOptions = useMemo(
    () =>
      stock
        .filter((item) => item.productId && item.productName)
        .map((item) => ({
          productId: item.productId,
          name: item.productName ?? "Unnamed product",
          availableStock: item.availableStock ?? 0,
          currentStock: item.currentStock ?? 0,
        })),
    [stock],
  );

  const updateWarehouse = trpc.warehouse.update.useMutation({
    onSuccess: async () => {
      await utils.warehouse.get.invalidate();
      await utils.warehouse.stats.invalidate();
      toast.success("Warehouse updated.");
      setEditing(false);
    },
    onError: (error) => toast.error(error.message || "Could not update warehouse."),
  });
  const createWarehouse = trpc.warehouse.create.useMutation({
    onSuccess: async () => {
      await invalidateWarehouseConfig();
      toast.success("Warehouse created.");
      setEditing(false);
    },
    onError: (error) => toast.error(error.message || "Could not create warehouse."),
  });
  const updateWarehouseById = trpc.warehouse.updateById.useMutation({
    onSuccess: async () => {
      await invalidateWarehouseConfig();
      toast.success("Warehouse updated.");
      setEditing(false);
    },
    onError: (error) => toast.error(error.message || "Could not update warehouse."),
  });
  const deleteWarehouse = trpc.warehouse.delete.useMutation({
    onSuccess: async () => {
      await invalidateWarehouseConfig();
      toast.success("Warehouse marked inactive.");
    },
    onError: (error) => toast.error(error.message || "Could not delete warehouse."),
  });

  const receiveStock = trpc.warehouse.receive.useMutation({
    onSuccess: async () => {
      await invalidateWarehouseData();
      toast.success("Stock received.");
      closeMovementDialogs();
    },
    onError: (error) => toast.error(error.message || "Could not receive stock."),
  });

  const dispatchStock = trpc.warehouse.dispatch.useMutation({
    onSuccess: async () => {
      await invalidateWarehouseData();
      toast.success("Stock dispatched.");
      closeMovementDialogs();
    },
    onError: (error) => toast.error(error.message || "Could not dispatch stock."),
  });
  const assignStock = trpc.warehouse.assignStock.useMutation({
    onSuccess: async () => {
      await invalidateWarehouseData();
      toast.success("Stock assigned to warehouse.");
    },
    onError: (error) => toast.error(error.message || "Could not assign stock."),
  });

  async function invalidateWarehouseData() {
    await utils.warehouse.stock.invalidate();
    await utils.warehouse.stats.invalidate();
    await utils.warehouse.movements.invalidate();
    await utils.inventory.list.invalidate();
    await utils.inventory.stats.invalidate();
  }

  async function invalidateWarehouseConfig() {
    await Promise.all([
      utils.warehouse.get.invalidate(),
      utils.warehouse.list.invalidate(),
      utils.warehouse.stats.invalidate(),
    ]);
  }

  function startEditing() {
    setWarehouseForm(
      warehouse
        ? {
            id: warehouse.id,
            name: warehouse.name,
            code: warehouse.code ?? "",
            description: warehouse.description ?? "",
            address: warehouse.address,
            city: warehouse.city ?? "",
            state: warehouse.state ?? "",
            postalCode: warehouse.postalCode ?? "",
            country: warehouse.country ?? "India",
            capacityUnits: String(warehouse.capacityUnits ?? 0),
            usedCapacityUnits: String(warehouse.usedCapacityUnits ?? 0),
            isDefault: warehouse.isDefault,
            contactPerson: warehouse.contactPerson ?? "",
            contactNumber: warehouse.contactNumber ?? "",
            status: warehouse.status,
          }
        : emptyWarehouseForm,
    );
    setEditing(true);
  }

  function startCreating() {
    setWarehouseForm({
      ...emptyWarehouseForm,
      code: `WH-${String(warehouseList.length + 1).padStart(3, "0")}`,
      isDefault: warehouseList.length === 0,
    });
    setEditing(true);
  }

  function editWarehouse(item: {
    id: number;
    name: string;
    code: string | null;
    description?: string | null;
    address: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country?: string | null;
    capacityUnits: number;
    usedCapacityUnits: number;
    isDefault: boolean;
    contactPerson?: string | null;
    contactNumber?: string | null;
    status: WarehouseStatus;
  }) {
    setWarehouseForm({
      id: item.id,
      name: item.name,
      code: item.code ?? "",
      description: item.description ?? "",
      address: item.address,
      city: item.city ?? "",
      state: item.state ?? "",
      postalCode: item.postalCode ?? "",
      country: item.country ?? "India",
      capacityUnits: String(item.capacityUnits ?? 0),
      usedCapacityUnits: String(item.usedCapacityUnits ?? 0),
      isDefault: item.isDefault,
      contactPerson: item.contactPerson ?? "",
      contactNumber: item.contactNumber ?? "",
      status: item.status,
    });
    setEditing(true);
  }

  function saveWarehouse() {
    if (!warehouseForm.name.trim()) {
      toast.error("Warehouse name is required.");
      return;
    }
    if (!warehouseForm.address.trim()) {
      toast.error("Warehouse address is required.");
      return;
    }
    const payload = {
      name: warehouseForm.name.trim(),
      code: warehouseForm.code.trim(),
      description: warehouseForm.description.trim(),
      address: warehouseForm.address.trim(),
      city: warehouseForm.city.trim(),
      state: warehouseForm.state.trim(),
      postalCode: warehouseForm.postalCode.trim(),
      country: warehouseForm.country.trim(),
      capacityUnits: Math.max(0, Number(warehouseForm.capacityUnits) || 0),
      usedCapacityUnits: Math.max(0, Number(warehouseForm.usedCapacityUnits) || 0),
      isDefault: warehouseForm.isDefault,
      contactPerson: warehouseForm.contactPerson.trim(),
      contactNumber: warehouseForm.contactNumber.trim(),
      status: warehouseForm.status,
    };
    if (warehouseForm.id) {
      updateWarehouseById.mutate({ id: warehouseForm.id, ...payload });
    } else if (warehouse) {
      updateWarehouse.mutate(payload);
    } else {
      createWarehouse.mutate(payload);
    }
  }

  function openMovementDialog(type: MovementType, productId?: number) {
    setMovementForm({
      ...emptyMovementForm,
      productId: productId ? String(productId) : "",
    });
    if (type === "receive") {
      setReceiveOpen(true);
    } else {
      setDispatchOpen(true);
    }
  }

  function closeMovementDialogs() {
    setReceiveOpen(false);
    setDispatchOpen(false);
    setMovementForm(emptyMovementForm);
  }

  function submitReceive() {
    const productId = Number(movementForm.productId);
    const quantity = Number(movementForm.quantity);
    if (!productId || !quantity) {
      toast.error("Product and quantity are required.");
      return;
    }
    receiveStock.mutate({
      productId,
      quantity,
      supplierName: movementForm.supplierName.trim(),
      reference: movementForm.reference.trim(),
      notes: movementForm.notes.trim(),
    });
  }

  function submitDispatch() {
    const productId = Number(movementForm.productId);
    const quantity = Number(movementForm.quantity);
    const orderId = movementForm.orderId ? Number(movementForm.orderId) : undefined;
    if (!productId || !quantity) {
      toast.error("Product and quantity are required.");
      return;
    }
    dispatchStock.mutate({
      productId,
      quantity,
      orderId,
      notes: movementForm.notes.trim(),
    });
  }

  if (warehouseQuery.isLoading && !warehouseMissing) {
    return <WarehouseSkeleton />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard / Warehouse</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Warehouse</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={startCreating}>
            <WarehouseIcon className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
          <Button onClick={() => openMovementDialog("receive")} disabled={!warehouse || warehouse.status !== "active"}>
            <ArrowDownLeft className="mr-2 h-4 w-4" />
            Receive Stock
          </Button>
          <Button variant="outline" onClick={() => openMovementDialog("dispatch")} disabled={!warehouse || warehouse.status !== "active"}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Dispatch Stock
          </Button>
        </div>
      </section>

      {!warehouse && warehouseMissing && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No warehouse configured</AlertTitle>
          <AlertDescription>
            Add the company warehouse before receiving or dispatching stock.
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total Products" value={statsQuery.data?.totalProducts ?? 0} loading={statsQuery.isLoading} icon={Package} />
        <Metric title="Current Stock" value={formatNumber(statsQuery.data?.currentStock ?? 0)} loading={statsQuery.isLoading} icon={WarehouseIcon} />
        <Metric title="Received Today" value={formatNumber(statsQuery.data?.receivedToday ?? 0)} loading={statsQuery.isLoading} icon={ArrowDownLeft} />
        <Metric title="Dispatched Today" value={formatNumber(statsQuery.data?.dispatchedToday ?? 0)} loading={statsQuery.isLoading} icon={ArrowUpRight} />
      </section>

      <Tabs defaultValue="dashboard" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto rounded-lg border bg-card p-1 sm:w-fit">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="grid gap-4 xl:grid-cols-[1fr_1.25fr]">
          <WarehouseInformation
            editing={editing || !warehouse}
            warehouse={warehouse}
            warehouses={warehouseList}
            form={warehouseForm}
            loading={updateWarehouse.isPending || createWarehouse.isPending || updateWarehouseById.isPending}
            onEdit={startEditing}
            onCreate={startCreating}
            onSelect={editWarehouse}
            onDelete={(id) => deleteWarehouse.mutate({ id })}
            onCancel={() => setEditing(false)}
            onSave={saveWarehouse}
            onChange={(field, value) => setWarehouseForm((current) => ({ ...current, [field]: value }))}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementTable movements={movements.slice(0, 6)} loading={movementsQuery.isLoading} compact />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search warehouse stock..."
                  className="pl-9"
                />
              </div>
              <Select value={stockStatus} onValueChange={(value) => setStockStatus(value as StockStatus)}>
                <SelectTrigger className="w-full lg:w-[190px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <StockTable
                stock={stock}
                warehouses={warehouseList.filter((item) => item.status === "active")}
                loading={stockQuery.isLoading}
                onReceive={(productId) => openMovementDialog("receive", productId)}
                onDispatch={(productId) => openMovementDialog("dispatch", productId)}
                onAssign={(inventoryId, warehouseId) => assignStock.mutate({ inventoryId, warehouseId })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Stock Movement History</h2>
                <p className="text-sm text-muted-foreground">Receive and dispatch records are saved automatically.</p>
              </div>
              <Select value={movementType} onValueChange={(value) => setMovementType(value as MovementType | "all")}>
                <SelectTrigger className="w-full lg:w-[190px]">
                  <SelectValue placeholder="Movement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movements</SelectItem>
                  <SelectItem value="receive">Receive</SelectItem>
                  <SelectItem value="dispatch">Dispatch</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <MovementTable movements={movements} loading={movementsQuery.isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MovementDialog
        type="receive"
        open={receiveOpen}
        form={movementForm}
        products={productOptions}
        loading={receiveStock.isPending}
        onClose={closeMovementDialogs}
        onSubmit={submitReceive}
        onChange={(field, value) => setMovementForm((current) => ({ ...current, [field]: value }))}
      />
      <MovementDialog
        type="dispatch"
        open={dispatchOpen}
        form={movementForm}
        products={productOptions}
        loading={dispatchStock.isPending}
        onClose={closeMovementDialogs}
        onSubmit={submitDispatch}
        onChange={(field, value) => setMovementForm((current) => ({ ...current, [field]: value }))}
      />
    </div>
  );
}

function WarehouseInformation({
  editing,
  warehouse,
  warehouses,
  form,
  loading,
  onEdit,
  onCreate,
  onSelect,
  onDelete,
  onCancel,
  onSave,
  onChange,
}: {
  editing: boolean;
  warehouse: { name: string; code: string | null; description: string | null; address: string; city: string | null; state: string | null; postalCode: string | null; country: string | null; capacityUnits: number; usedCapacityUnits: number; isDefault: boolean; contactPerson: string | null; contactNumber: string | null; status: WarehouseStatus } | null;
  warehouses: Array<{ id: number; name: string; code: string | null; address: string; city: string | null; state: string | null; postalCode: string | null; capacityUnits: number; usedCapacityUnits: number; isDefault: boolean; status: WarehouseStatus }>;
  form: WarehouseForm;
  loading: boolean;
  onEdit: () => void;
  onCreate: () => void;
  onSelect: (warehouse: { id: number; name: string; code: string | null; description?: string | null; address: string; city: string | null; state: string | null; postalCode: string | null; country?: string | null; capacityUnits: number; usedCapacityUnits: number; isDefault: boolean; contactPerson?: string | null; contactNumber?: string | null; status: WarehouseStatus }) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: keyof WarehouseForm, value: string | boolean) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">Warehouse Information</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCreate}>
            <WarehouseIcon className="mr-2 h-4 w-4" />
            Add
          </Button>
          {!editing && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Warehouse Name" required>
                <Input value={form.name} onChange={(event) => onChange("name", event.target.value)} />
              </Field>
              <Field label="Warehouse Code">
                <Input value={form.code} onChange={(event) => onChange("code", event.target.value)} />
              </Field>
              <Field label="Contact Person">
                <Input value={form.contactPerson} onChange={(event) => onChange("contactPerson", event.target.value)} />
              </Field>
              <Field label="Contact Number">
                <Input value={form.contactNumber} onChange={(event) => onChange("contactNumber", event.target.value)} />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(event) => onChange("city", event.target.value)} />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={(event) => onChange("state", event.target.value)} />
              </Field>
              <Field label="Postal Code">
                <Input value={form.postalCode} onChange={(event) => onChange("postalCode", event.target.value)} />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={(event) => onChange("country", event.target.value)} />
              </Field>
              <Field label="Capacity Units">
                <Input type="number" min={0} value={form.capacityUnits} onChange={(event) => onChange("capacityUnits", event.target.value)} />
              </Field>
              <Field label="Used Capacity">
                <Input type="number" min={0} value={form.usedCapacityUnits} onChange={(event) => onChange("usedCapacityUnits", event.target.value)} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(value) => onChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <label className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>Default warehouse</span>
                <input type="checkbox" checked={form.isDefault} onChange={(event) => onChange("isDefault", event.target.checked)} />
              </label>
            </div>
            <Field label="Address" required>
              <Textarea value={form.address} onChange={(event) => onChange("address", event.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(event) => onChange("description", event.target.value)} />
            </Field>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {warehouse && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
              <Button onClick={onSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReadOnly label="Name" value={warehouse?.name} />
              <ReadOnly label="Code" value={warehouse?.code} />
              <ReadOnly label="Status" value={<WarehouseStatusBadge status={warehouse?.status ?? "inactive"} />} />
              <ReadOnly label="Default" value={warehouse?.isDefault ? "Yes" : "No"} />
              <ReadOnly label="Contact" value={warehouse?.contactPerson} />
              <ReadOnly label="Phone" value={warehouse?.contactNumber} />
              <ReadOnly label="Capacity" value={`${formatNumber(warehouse?.usedCapacityUnits ?? 0)} / ${formatNumber(warehouse?.capacityUnits ?? 0)}`} />
              <ReadOnly label="Location" value={[warehouse?.city, warehouse?.state, warehouse?.postalCode].filter(Boolean).join(", ")} />
              <ReadOnly label="Address" value={warehouse?.address} className="sm:col-span-2" />
            </div>
            {!!warehouses.length && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Warehouse Selection</h3>
                <div className="grid gap-2">
                  {warehouses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <button type="button" className="min-w-0 text-left" onClick={() => onSelect(item)}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.isDefault && <Badge variant="outline" className="rounded-md">Default</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {[item.code, item.city, item.postalCode].filter(Boolean).join(" / ") || item.address}
                        </div>
                      </button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSelect(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)} disabled={item.isDefault}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StockTable({
  stock,
  warehouses,
  loading,
  onReceive,
  onDispatch,
  onAssign,
}: {
  stock: Array<{
    inventoryId: number;
    productId: number;
    productName: string | null;
    availableStock: number;
    reservedStock: number;
    currentStock: number;
    status: string;
    warehouseLocation: string | null;
    lastUpdated: Date;
  }>;
  warehouses: Array<{ id: number; name: string }>;
  loading: boolean;
  onReceive: (productId: number) => void;
  onDispatch: (productId: number) => void;
  onAssign: (inventoryId: number, warehouseId: number) => void;
}) {
  if (loading) {
    return <TableSkeleton columns={6} />;
  }
  if (!stock.length) {
    return <EmptyState icon={Package} title="No stock available" description="Products with inventory will appear here." />;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Assign</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stock.map((item) => (
            <TableRow key={item.productId}>
              <TableCell>
                <div className="font-medium">{item.productName ?? "Unnamed product"}</div>
                <div className="text-xs text-muted-foreground">Updated {formatDate(item.lastUpdated)}</div>
              </TableCell>
              <TableCell>{formatNumber(item.availableStock)}</TableCell>
              <TableCell>{formatNumber(item.reservedStock)}</TableCell>
              <TableCell><StockStatusBadge status={item.status} /></TableCell>
              <TableCell>{item.warehouseLocation ?? "Main warehouse"}</TableCell>
              <TableCell>
                <Select onValueChange={(value) => onAssign(item.inventoryId, Number(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Move stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onReceive(item.productId)}>Receive</Button>
                  <Button variant="outline" size="sm" onClick={() => onDispatch(item.productId)}>Dispatch</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MovementTable({
  movements,
  loading,
  compact = false,
}: {
  movements: Array<{
    id: number;
    productName: string | null;
    type: MovementType;
    quantity: number;
    reference: string | null;
    orderId: number | null;
    notes: string | null;
    performedByName: string | null;
    createdAt: Date;
  }>;
  loading: boolean;
  compact?: boolean;
}) {
  if (loading) {
    return <TableSkeleton columns={compact ? 4 : 6} />;
  }
  if (!movements.length) {
    return <EmptyState icon={History} title="No movement history" description="Receive and dispatch operations will appear here." />;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Movement</TableHead>
            <TableHead>Quantity</TableHead>
            {!compact && <TableHead>Reference</TableHead>}
            {!compact && <TableHead>User</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{formatDate(movement.createdAt)}</TableCell>
              <TableCell>{movement.productName ?? "Product"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-md capitalize">
                  {movement.type}
                </Badge>
              </TableCell>
              <TableCell className={movement.type === "receive" ? "text-emerald-700" : "text-amber-700"}>
                {movement.type === "receive" ? "+" : "-"}{formatNumber(movement.quantity)}
              </TableCell>
              {!compact && <TableCell>{movement.reference ?? (movement.orderId ? `Order ${movement.orderId}` : "Not set")}</TableCell>}
              {!compact && <TableCell>{movement.performedByName ?? "Business Owner"}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MovementDialog({
  type,
  open,
  form,
  products,
  loading,
  onClose,
  onSubmit,
  onChange,
}: {
  type: MovementType;
  open: boolean;
  form: MovementForm;
  products: Array<{ productId: number; name: string; availableStock: number; currentStock: number }>;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof MovementForm, value: string) => void;
}) {
  const selected = products.find((item) => String(item.productId) === form.productId);
  const receiving = type === "receive";
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{receiving ? "Receive Stock" : "Dispatch Stock"}</DialogTitle>
          <DialogDescription>
            {receiving ? "Add physical stock to the active warehouse." : "Dispatch stock from the active warehouse."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Product" required>
            <Select value={form.productId} onValueChange={(value) => onChange("productId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.productId} value={String(product.productId)}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {selected && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              {receiving ? "Current stock" : "Available stock"}: {formatNumber(receiving ? selected.currentStock : selected.availableStock)}
            </div>
          )}
          <Field label={receiving ? "Receive Quantity" : "Dispatch Quantity"} required>
            <Input type="number" min={1} value={form.quantity} onChange={(event) => onChange("quantity", event.target.value)} />
          </Field>
          {receiving ? (
            <>
              <Field label="Supplier">
                <Input value={form.supplierName} onChange={(event) => onChange("supplierName", event.target.value)} />
              </Field>
              <Field label="Reference Number">
                <Input value={form.reference} onChange={(event) => onChange("reference", event.target.value)} />
              </Field>
            </>
          ) : (
            <Field label="Order Reference">
              <Input type="number" min={1} value={form.orderId} onChange={(event) => onChange("orderId", event.target.value)} />
            </Field>
          )}
          <Field label="Notes">
            <Textarea value={form.notes} onChange={(event) => onChange("notes", event.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} disabled={loading}>
            {receiving ? <ArrowDownLeft className="mr-2 h-4 w-4" /> : <ArrowUpRight className="mr-2 h-4 w-4" />}
            {receiving ? "Receive Stock" : "Dispatch Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[112px] items-start justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
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
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ReadOnly({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{value || "Not set"}</div>
    </div>
  );
}

function WarehouseStatusBadge({ status }: { status: WarehouseStatus }) {
  return (
    <Badge variant={status === "active" ? "default" : "secondary"} className="rounded-md capitalize">
      {status}
    </Badge>
  );
}

function StockStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className="rounded-md">
      {stockStatusLabels[status] ?? status}
    </Badge>
  );
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, column) => (
            <Skeleton key={column} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Package;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
      <Icon className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function WarehouseSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-[420px]" />
    </div>
  );
}
