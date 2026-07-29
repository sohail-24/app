import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  ClipboardList,
  Edit,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomerStatus = "active" | "inactive" | "blocked";
type CustomerFilter = "all" | CustomerStatus;

type CustomerForm = {
  id?: number;
  buyerCompanyId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  notes: string;
};

type CustomerRow = {
  id: number;
  buyerCompanyId: number | null;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  linkedCompanyName: string | null;
  orderCount: number;
  lifetimeValue: string;
  lastOrderAt: Date | null;
};

const emptyForm: CustomerForm = {
  buyerCompanyId: "",
  name: "",
  contactName: "",
  email: "",
  phone: "",
  status: "active",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  taxId: "",
  notes: "",
};

const statusClass: Record<CustomerStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  inactive: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200",
  blocked: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200",
};

export default function Customers() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const customersQuery = trpc.customer.list.useQuery(
    {
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
      size: 100,
    },
    { retry: false },
  );
  const statsQuery = trpc.customer.stats.useQuery(undefined, { retry: false });
  const detailQuery = trpc.customer.detail.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId, retry: false },
  );
  const historyQuery = trpc.customer.orderHistory.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId, retry: false },
  );
  const companiesQuery = trpc.company.list.useQuery(undefined, { retry: false });

  const customers = customersQuery.data?.items ?? [];
  const selected = detailQuery.data ?? null;
  const buyers = (companiesQuery.data ?? []).filter((company) => company.type === "buyer" || company.type === "both");

  const listTotal = customersQuery.data?.total ?? 0;
  const lifetimeValue = useMemo(
    () => customers.reduce((total, customer) => total + Number(customer.lifetimeValue ?? 0), 0),
    [customers],
  );

  const afterChange = async (message: string) => {
    await Promise.all([
      utils.customer.list.invalidate(),
      utils.customer.stats.invalidate(),
      utils.customer.detail.invalidate(),
      utils.customer.orderHistory.invalidate(),
    ]);
    toast.success(message);
  };

  const createCustomer = trpc.customer.create.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Customer created.");
    },
    onError: (error) => toast.error(error.message || "Could not create customer."),
  });
  const updateCustomer = trpc.customer.update.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Customer updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update customer."),
  });
  const deleteCustomer = trpc.customer.delete.useMutation({
    onSuccess: () => afterChange("Customer marked inactive."),
    onError: (error) => toast.error(error.message || "Could not update customer."),
  });

  function openCreate() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(customer: CustomerRow) {
    setSelectedId(customer.id);
    setForm({
      ...emptyForm,
      id: customer.id,
      buyerCompanyId: customer.buyerCompanyId ? String(customer.buyerCompanyId) : "",
      name: customer.name,
      contactName: customer.contactName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      status: customer.status,
      city: customer.city ?? "",
      state: customer.state ?? "",
      postalCode: customer.postalCode ?? "",
      country: customer.country ?? "India",
      taxId: customer.taxId ?? "",
    });
    setDialogOpen(true);
  }

  function saveCustomer() {
    if (!form.name.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    const payload = {
      buyerCompanyId: form.buyerCompanyId ? Number(form.buyerCompanyId) : undefined,
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      taxId: form.taxId.trim(),
      notes: form.notes.trim(),
    };
    if (form.id) {
      updateCustomer.mutate({ id: form.id, ...payload });
    } else {
      createCustomer.mutate(payload);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage buyer profiles, contacts, service status, and order history.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Customers" value={formatNumber(statsQuery.data?.total ?? listTotal)} loading={statsQuery.isLoading} icon={Users} />
        <Metric label="Active" value={formatNumber(statsQuery.data?.active ?? 0)} loading={statsQuery.isLoading} icon={Building2} />
        <Metric label="Blocked" value={formatNumber(statsQuery.data?.blocked ?? 0)} loading={statsQuery.isLoading} icon={ShieldAlert} />
        <Metric label="Visible Value" value={formatCurrency(lifetimeValue)} loading={customersQuery.isLoading} icon={ClipboardList} />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers, city, email, phone..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as CustomerFilter)}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <Card>
          <CardContent className="p-0">
            {customersQuery.isLoading ? (
              <TableSkeleton />
            ) : customers.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead className="pr-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className={selectedId === customer.id ? "bg-muted/50" : undefined}
                        onClick={() => setSelectedId(customer.id)}
                      >
                        <TableCell className="pl-4">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.linkedCompanyName ?? ([customer.city, customer.state].filter(Boolean).join(", ") || "Standalone profile")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {customer.email && <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{customer.email}</div>}
                            {customer.phone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{customer.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell><CustomerStatusBadge status={customer.status} /></TableCell>
                        <TableCell>
                          <div className="font-medium">{formatNumber(customer.orderCount)}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(customer.lifetimeValue)}</div>
                        </TableCell>
                        <TableCell>{formatDate(customer.lastOrderAt)}</TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); openEdit(customer); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(event) => { event.stopPropagation(); deleteCustomer.mutate({ id: customer.id }); }}>
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
              <EmptyState onCreate={openCreate} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedId ? (
              <div className="flex min-h-72 items-center justify-center text-center text-sm text-muted-foreground">
                Select a customer to view details and order history.
              </div>
            ) : detailQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : selected ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">{selected.contactName ?? selected.linkedCompanyName ?? "Customer account"}</p>
                    </div>
                    <CustomerStatusBadge status={selected.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <ProfileLine label="Email" value={selected.email} />
                    <ProfileLine label="Phone" value={selected.phone} />
                    <ProfileLine label="GST / Tax ID" value={selected.taxId} />
                    <ProfileLine label="Address" value={[selected.addressLine1, selected.addressLine2, selected.city, selected.state, selected.postalCode, selected.country].filter(Boolean).join(", ")} />
                    <ProfileLine label="Notes" value={selected.notes} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Order History</h3>
                  {(historyQuery.data ?? []).length ? (
                    <div className="space-y-2">
                      {(historyQuery.data ?? []).slice(0, 8).map((order) => (
                        <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-md border p-3 hover:bg-muted/50">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{order.orderNumber}</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="capitalize">{order.status.replaceAll("_", " ")}</span>
                            <span>{formatDate(order.orderedAt)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                      No linked orders yet. Link this customer to a buyer company to show order history.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription>
              Customer records are owner-managed and can be linked to buyer companies for order history.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            <Field label="Customer Name" required>
              <Input value={form.name} onChange={(event) => setFormValue("name", event.target.value)} />
            </Field>
            <Field label="Linked Buyer Company">
              <Select value={form.buyerCompanyId || "none"} onValueChange={(value) => setFormValue("buyerCompanyId", value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked company</SelectItem>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={String(buyer.id)}>{buyer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Contact Name"><Input value={form.contactName} onChange={(event) => setFormValue("contactName", event.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => setFormValue("status", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(event) => setFormValue("email", event.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(event) => setFormValue("phone", event.target.value)} /></Field>
            <Field label="Address Line 1"><Input value={form.addressLine1} onChange={(event) => setFormValue("addressLine1", event.target.value)} /></Field>
            <Field label="Address Line 2"><Input value={form.addressLine2} onChange={(event) => setFormValue("addressLine2", event.target.value)} /></Field>
            <Field label="City"><Input value={form.city} onChange={(event) => setFormValue("city", event.target.value)} /></Field>
            <Field label="State"><Input value={form.state} onChange={(event) => setFormValue("state", event.target.value)} /></Field>
            <Field label="Postal Code"><Input value={form.postalCode} onChange={(event) => setFormValue("postalCode", event.target.value)} /></Field>
            <Field label="Country"><Input value={form.country} onChange={(event) => setFormValue("country", event.target.value)} /></Field>
            <Field label="GST / Tax ID"><Input value={form.taxId} onChange={(event) => setFormValue("taxId", event.target.value)} /></Field>
            <div className="md:col-span-2">
              <Field label="Notes"><Textarea value={form.notes} onChange={(event) => setFormValue("notes", event.target.value)} /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCustomer} disabled={createCustomer.isPending || updateCustomer.isPending}>
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function setFormValue(field: keyof CustomerForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
}

function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge className={`rounded-md capitalize ${statusClass[status]}`}>{status}</Badge>;
}

function Metric({ label, value, loading, icon: Icon }: { label: string; value: string | number; loading: boolean; icon: typeof Users }) {
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

function ProfileLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 rounded-md border p-3">
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
      <span>{value || "Not set"}</span>
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="font-semibold">No customers found</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Create customer profiles to track contacts, status, and order history in one place.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>
    </div>
  );
}
