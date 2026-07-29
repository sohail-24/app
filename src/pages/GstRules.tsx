import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
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
import { Edit, FolderTree, Plus, ReceiptText, Search, ShieldCheck, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type GstStatus = "active" | "inactive";
type GstFilter = "all" | GstStatus;

type GstForm = {
  id?: number;
  categoryId: string;
  name: string;
  gstin: string;
  hsnCode: string;
  rate: string;
  status: GstStatus;
};

type GstRow = {
  id: number;
  categoryId: number;
  name: string;
  gstin: string | null;
  hsnCode: string | null;
  rate: string;
  status: GstStatus;
  categoryName: string | null;
};

const emptyForm: GstForm = {
  categoryId: "",
  name: "",
  gstin: "",
  hsnCode: "",
  rate: "5",
  status: "active",
};

export default function GstRules() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GstFilter>("all");
  const [calculatorCategoryId, setCalculatorCategoryId] = useState("");
  const [calculatorSubtotal, setCalculatorSubtotal] = useState("1000");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<GstForm>(emptyForm);

  const rulesQuery = trpc.gst.list.useQuery(
    { search: search.trim() || undefined, status: status === "all" ? undefined : status },
    { retry: false },
  );
  const categoriesQuery = trpc.category.list.useQuery({ includeInactive: false }, { retry: false });
  const statsQuery = trpc.gst.stats.useQuery(undefined, { retry: false });
  const calculationQuery = trpc.gst.calculate.useQuery(
    {
      items: calculatorCategoryId
        ? [{
            categoryId: Number(calculatorCategoryId),
            taxableAmount: Math.max(0, Number(calculatorSubtotal) || 0),
          }]
        : [],
    },
    { enabled: !!calculatorCategoryId, retry: false },
  );

  const rules = rulesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const afterChange = async (message: string) => {
    await Promise.all([
      utils.gst.list.invalidate(),
      utils.gst.stats.invalidate(),
      utils.gst.calculate.invalidate(),
      utils.order.list.invalidate(),
      utils.order.recent.invalidate(),
    ]);
    toast.success(message);
  };

  const createRule = trpc.gst.create.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Category GST mapping created.");
    },
    onError: (error) => toast.error(error.message || "Could not create GST mapping."),
  });
  const updateRule = trpc.gst.update.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      await afterChange("Category GST mapping updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update GST mapping."),
  });
  const deleteRule = trpc.gst.delete.useMutation({
    onSuccess: () => afterChange("Category GST mapping disabled."),
    onError: (error) => toast.error(error.message || "Could not disable GST mapping."),
  });

  function openCreate() {
    const firstUnmapped = categories.find(
      (category) => !rules.some((rule) => rule.categoryId === category.id),
    );
    setForm({
      ...emptyForm,
      categoryId: firstUnmapped ? String(firstUnmapped.id) : "",
      name: firstUnmapped ? `${firstUnmapped.name} GST` : "",
    });
    setDialogOpen(true);
  }

  function openEdit(rule: GstRow) {
    setForm({
      id: rule.id,
      categoryId: String(rule.categoryId),
      name: rule.name,
      gstin: rule.gstin ?? "",
      hsnCode: rule.hsnCode ?? "",
      rate: String(rule.rate),
      status: rule.status,
    });
    setDialogOpen(true);
  }

  function saveRule() {
    if (!form.categoryId) {
      toast.error("Category is required.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("GST mapping name is required.");
      return;
    }
    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name.trim(),
      gstin: form.gstin.trim(),
      hsnCode: form.hsnCode.trim(),
      rate: Math.max(0, Number(form.rate) || 0),
      status: form.status,
    };
    if (form.id) updateRule.mutate({ id: form.id, ...payload });
    else createRule.mutate(payload);
  }

  const calculatedTax = calculationQuery.data?.taxAmount ?? 0;
  const calculatorTotal = (Number(calculatorSubtotal) || 0) + calculatedTax;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">GST Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Map each product category to its GST percentage for automatic checkout tax.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Mapping
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="GST Mappings" value={formatNumber(statsQuery.data?.total ?? 0)} loading={statsQuery.isLoading} icon={ReceiptText} />
        <Metric label="Active Mappings" value={formatNumber(statsQuery.data?.active ?? 0)} loading={statsQuery.isLoading} icon={ShieldCheck} />
        <Metric label="Mapped Categories" value={formatNumber(statsQuery.data?.mappedCategories ?? 0)} loading={statsQuery.isLoading} icon={FolderTree} />
      </section>

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search category, GSTIN, HSN..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as GstFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mappings</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-0">
            {rulesQuery.isLoading ? (
              <TableSkeleton />
            ) : rules.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Category</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>HSN</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="pl-4">
                          <div className="font-medium">{rule.categoryName ?? "Category"}</div>
                          <div className="text-xs text-muted-foreground">{rule.name}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{rule.gstin ?? "Not set"}</TableCell>
                        <TableCell>{rule.hsnCode ?? "Not set"}</TableCell>
                        <TableCell>{formatNumber(rule.rate)}%</TableCell>
                        <TableCell>
                          <Badge className={rule.status === "active" ? "rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200" : "rounded-md bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200"}>
                            {rule.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRule.mutate({ id: rule.id })}>
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
                <ReceiptText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="font-semibold">No category GST mappings</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Add one GST mapping per product category to automate tax calculation.
                </p>
                <Button className="mt-5" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mapping
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="font-semibold">Category Tax Calculator</h2>
              <p className="text-sm text-muted-foreground">Preview tax for a category subtotal.</p>
            </div>
            <Field label="Category">
              <Select value={calculatorCategoryId || "none"} onValueChange={(value) => setCalculatorCategoryId(value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category Subtotal">
              <Input type="number" min={0} value={calculatorSubtotal} onChange={(event) => setCalculatorSubtotal(event.target.value)} />
            </Field>
            <div className="rounded-md border p-4">
              <div className="flex justify-between text-sm">
                <span>Tax Amount</span>
                <span>{formatCurrency(calculatedTax)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(calculatorTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit GST Mapping" : "Add GST Mapping"}</DialogTitle>
            <DialogDescription>
              Each product category can have one GST mapping.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category" required>
              <Select value={form.categoryId || "none"} onValueChange={(value) => {
                const category = categories.find((item) => String(item.id) === value);
                setForm((current) => ({
                  ...current,
                  categoryId: value === "none" ? "" : value,
                  name: current.name || (category ? `${category.name} GST` : ""),
                }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rate (%)" required><Input type="number" min={0} max={28} value={form.rate} onChange={(event) => setFormValue("rate", event.target.value)} /></Field>
            <Field label="Mapping Name" required><Input value={form.name} onChange={(event) => setFormValue("name", event.target.value)} /></Field>
            <Field label="GSTIN"><Input value={form.gstin} onChange={(event) => setFormValue("gstin", event.target.value.toUpperCase())} /></Field>
            <Field label="HSN Code"><Input value={form.hsnCode} onChange={(event) => setFormValue("hsnCode", event.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => setFormValue("status", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveRule} disabled={createRule.isPending || updateRule.isPending}>Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function setFormValue(field: keyof GstForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
}

function Metric({ label, value, loading, icon: Icon }: { label: string; value: string | number; loading: boolean; icon: typeof ReceiptText }) {
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
