import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, getProductMeta, getPurchasePrice, getSku, toNumber, unitLabels } from "@/lib/i18n";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Image as ImageIcon,
  IndianRupee,
  Leaf,
  Package,
  Save,
  Star,
  Tag,
  Trash2,
  UploadCloud,
  Warehouse,
  Scale,
  Boxes,
  ShoppingBag,
  Weight,
  Grape,
  CircleDot,
} from "lucide-react";

const unitStyles: Record<string, { icon: any; color: string; bg: string }> = {
  kg: { icon: Scale, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  box: { icon: Package, color: "text-blue-600", bg: "bg-blue-600/10" },
  case: { icon: Boxes, color: "text-purple-500", bg: "bg-purple-500/10" },
  bag: { icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-500/10" },
  lb: { icon: Weight, color: "text-red-500", bg: "bg-red-500/10" },
  pallet: { icon: Warehouse, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  bunch: { icon: Grape, color: "text-pink-500", bg: "bg-pink-500/10" },
  each: { icon: CircleDot, color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

type ProductForm = {
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  description: string;
  purchasePrice: string;
  wholesalePrice: string;
  sellingPrice: string;
  discount: string;
  supplierId: string;
  availableStock: string;
  reservedStock: string;
  onHandStock: string;
  reorderLevel: string;
  reorderQuantity: string;
  warehouse: string;
  batchNumber: string;
  status: "draft" | "active" | "archived";
  unitType: "kg" | "lb" | "case" | "pallet" | "each" | "bunch" | "box" | "bag";
  unitSize: string;
  minimumOrderQuantity: string;
  grade: "premium" | "grade_a" | "grade_b" | "standard";
  organic: boolean;
  tags: string;
};

type ImageRow = {
  id: string;
  url: string;
  failed?: boolean;
};

const unitOptions: ProductForm["unitType"][] = ["kg", "box", "case", "bag", "lb", "pallet", "bunch", "each"];
const gradeLabels: Record<ProductForm["grade"], string> = {
  premium: "Premium",
  grade_a: "Grade A",
  grade_b: "Grade B",
  standard: "Standard",
};

function emptyForm(): ProductForm {
  return {
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    description: "",
    purchasePrice: "",
    wholesalePrice: "",
    sellingPrice: "",
    discount: "0",
    supplierId: "",
    availableStock: "",
    reservedStock: "0",
    onHandStock: "0",
    reorderLevel: "10",
    reorderQuantity: "100",
    warehouse: "",
    batchNumber: "",
    status: "draft",
    unitType: "kg",
    unitSize: "",
    minimumOrderQuantity: "1",
    grade: "grade_a",
    organic: false,
    tags: "",
  };
}

function parseImages(images?: string | null, primary?: string | null) {
  const urls = new Set<string>();
  if (primary) urls.add(primary);
  if (images) {
    try {
      const parsed = JSON.parse(images) as unknown;
      if (Array.isArray(parsed)) {
        parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0).forEach((url) => urls.add(url));
      }
    } catch {
      if (images.trim()) urls.add(images.trim());
    }
  }
  return Array.from(urls).map((url, index) => ({ id: `${index}-${url}`, url }));
}

export default function EditProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ProductForm>(() => emptyForm());
  const [images, setImages] = useState<ImageRow[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const productQuery = trpc.product.bySlug.useQuery({ slug: slug! }, { enabled: !!slug, retry: false });
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const companiesQuery = trpc.company.list.useQuery(undefined, { retry: false });
  const productId = productQuery.data?.id;
  const inventoryQuery = trpc.inventory.byProduct.useQuery(
    { productId: productId ?? 0 },
    { enabled: !!productId, retry: false },
  );
  const updateProduct = trpc.product.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.list.invalidate(),
        utils.product.bySlug.invalidate(),
        utils.product.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
      ]);
      toast.success("Product updated successfully.");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error.message || "Could not update product. Please try again.");
    },
  });

  const product = productQuery.data;
  const categories = categoriesQuery.data ?? [];
  const suppliers = (companiesQuery.data ?? []).filter((company) => company.type === "supplier" || company.type === "both");
  const inventoryRecord = inventoryQuery.data?.[0];

  useEffect(() => {
    if (!product) return;
    const meta = getProductMeta(product);
    setForm({
      name: product.name ?? "",
      sku: meta.sku ?? getSku(product),
      barcode: meta.barcode ?? "",
      categoryId: String(product.categoryId ?? ""),
      description: product.description ?? "",
      purchasePrice: String(toNumber(product.compareAtPrice, getPurchasePrice(product.unitPrice))),
      wholesalePrice: meta.wholesalePrice !== undefined ? String(meta.wholesalePrice) : "",
      sellingPrice: String(toNumber(product.unitPrice)),
      discount: meta.discount !== undefined ? String(meta.discount) : "0",
      supplierId: String(product.supplierId ?? ""),
      availableStock: inventoryRecord ? String(inventoryRecord.quantityAvailable) : "",
      reservedStock: inventoryRecord ? String(inventoryRecord.quantityReserved) : "0",
      onHandStock: inventoryRecord ? String(inventoryRecord.quantityOnHand) : "0",
      reorderLevel: inventoryRecord ? String(inventoryRecord.reorderLevel) : "10",
      reorderQuantity: inventoryRecord ? String(inventoryRecord.reorderQuantity) : "100",
      warehouse: inventoryRecord?.warehouseLocation ?? "",
      batchNumber: inventoryRecord?.batchNumber ?? "",
      status: product.status as ProductForm["status"],
      unitType: product.unitType as ProductForm["unitType"],
      unitSize: product.unitSize ?? "",
      minimumOrderQuantity: String(product.minimumOrderQuantity ?? 1),
      grade: product.grade as ProductForm["grade"],
      organic: Boolean(product.organic),
      tags: meta.tags?.join(", ") ?? "",
    });
    setImages(parseImages(product.images, product.image));
  }, [product, inventoryRecord]);

  const margin = useMemo(() => {
    const selling = toNumber(form.sellingPrice);
    const purchase = toNumber(form.purchasePrice);
    if (!selling) return 0;
    return ((selling - purchase) / selling) * 100;
  }, [form.purchasePrice, form.sellingPrice]);

  const errors = {
    name: form.name.trim() ? "" : "Product name is required.",
    sku: form.sku.trim() ? "" : "SKU is required.",
    categoryId: form.categoryId ? "" : "Category is required.",
    purchasePrice: toNumber(form.purchasePrice) > 0 ? "" : "Purchase price must be greater than zero.",
    sellingPrice: toNumber(form.sellingPrice) > 0 ? "" : "Selling price must be greater than zero.",
    supplierId: form.supplierId ? "" : "Supplier is required.",
    onHandStock: toNumber(form.onHandStock) >= 0 ? "" : "Stock cannot be negative.",
    minimumOrderQuantity: toNumber(form.minimumOrderQuantity) > 0 ? "" : "Minimum order quantity must be greater than zero.",
  };
  const isFormValid = Object.values(errors).every((error) => !error);

  const updateField = <T extends keyof ProductForm>(field: T, value: ProductForm[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (images.some((image) => image.url === url)) {
      toast.error("This image URL is already attached.");
      return;
    }
    setImages((current) => [...current, { id: `${Date.now()}-${url}`, url }].slice(0, 8));
    setNewImageUrl("");
  };

  const setPrimaryImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (!target) return current;
      return [target, ...current.filter((image) => image.id !== id)];
    });
  };

  const removeImage = (id: string) => {
    setImages((current) => current.filter((image) => image.id !== id));
  };

  const markImageFailed = (id: string) => {
    setImages((current) => current.map((image) => (image.id === id ? { ...image, failed: true } : image)));
  };

  const saveProduct = () => {
    setAttemptedSubmit(true);
    if (!product || !isFormValid) {
      toast.error("Complete the required product fields before saving.");
      return;
    }

    updateProduct.mutate({
      id: product.id,
      name: form.name,
      sku: form.sku,
      barcode: form.barcode || undefined,
      categoryId: Number(form.categoryId),
      supplierId: Number(form.supplierId),
      description: form.description || undefined,
      purchasePrice: toNumber(form.purchasePrice),
      wholesalePrice: form.wholesalePrice ? toNumber(form.wholesalePrice) : undefined,
      sellingPrice: toNumber(form.sellingPrice),
      discount: toNumber(form.discount),
      openingStock: Math.max(0, Math.floor(toNumber(form.onHandStock))),
      availableStock: form.availableStock.trim()
        ? Math.max(0, Math.floor(toNumber(form.availableStock)))
        : undefined,
      reservedStock: Math.max(0, Math.floor(toNumber(form.reservedStock))),
      minimumStock: Math.max(0, Math.floor(toNumber(form.reorderLevel))),
      reorderQuantity: Math.max(0, Math.floor(toNumber(form.reorderQuantity))),
      warehouse: form.warehouse,
      batchNumber: form.batchNumber || undefined,
      status: form.status,
      unitType: form.unitType,
      unitSize: form.unitSize || undefined,
      minimumOrderQuantity: Math.max(1, Math.floor(toNumber(form.minimumOrderQuantity))),
      grade: form.grade,
      organic: form.organic,
      images: images.map((image) => image.url),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
  };

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1300px] space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-[360px]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-xl font-semibold">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This SKU may have been archived or moved.</p>
        <Link to="/products">
          <Button className="mt-5">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/products" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Edit Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update wholesale SKU details, buyer-facing catalog data, and publication status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/products/${product.slug}`}>
            <Button variant="outline">View Details</Button>
          </Link>
          <Button onClick={saveProduct} disabled={!isFormValid || updateProduct.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateProduct.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Product Name" required error={attemptedSubmit ? errors.name : ""}>
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              </Field>
              <Field label="Category" required error={attemptedSubmit ? errors.categoryId : ""}>
                <Select value={form.categoryId} onValueChange={(value) => updateField("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Supplier" required error={attemptedSubmit ? errors.supplierId : ""}>
                <Select value={form.supplierId} onValueChange={(value) => updateField("supplierId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={String(supplier.id)}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="SKU" required error={attemptedSubmit ? errors.sku : ""}>
                <Input value={form.sku} onChange={(event) => updateField("sku", event.target.value)} />
              </Field>
              <Field label="Barcode">
                <Input value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(value) => updateField("status", value as ProductForm["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                <Label htmlFor="organic-switch" className="flex items-center gap-2 text-sm">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  Organic
                </Label>
                <Switch id="organic-switch" checked={form.organic} onCheckedChange={(checked) => updateField("organic", checked)} />
              </div>
              <div className="md:col-span-2">
                <Field label="Description">
                  <Textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} className="min-h-28" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Tags">
                  <Input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="seasonal, bulk, premium" />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Wholesale Selling Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Unit">
                <Select value={form.unitType} onValueChange={(value) => updateField("unitType", value as ProductForm["unitType"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => {
                      const style = unitStyles[unit];
                      const Icon = style?.icon;
                      return (
                        <SelectItem key={unit} value={unit}>
                          <div className="flex items-center gap-2">
                            {Icon && (
                              <div className={`flex h-6 w-6 items-center justify-center rounded-md ${style.bg} ${style.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                            )}
                            <span>{unitLabels[unit] ?? unit}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Unit Size">
                <Input value={form.unitSize} onChange={(event) => updateField("unitSize", event.target.value)} placeholder="5 kg crate" />
              </Field>
              <Field label="Minimum Order" required error={attemptedSubmit ? errors.minimumOrderQuantity : ""}>
                <Input type="number" min="1" value={form.minimumOrderQuantity} onChange={(event) => updateField("minimumOrderQuantity", event.target.value)} />
              </Field>
              <Field label="Grade">
                <Select value={form.grade} onValueChange={(value) => updateField("grade", value as ProductForm["grade"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(gradeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={newImageUrl} onChange={(event) => setNewImageUrl(event.target.value)} placeholder="https://example.com/product-image.jpg" />
                <Button type="button" variant="outline" onClick={addImageUrl} disabled={images.length >= 8}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </div>
              {images.length ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                      {image.failed ? (
                        <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-700 dark:from-emerald-950/30 dark:to-sky-950/30 dark:text-emerald-200">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      ) : (
                        <img src={image.url} alt={`${form.name} ${index + 1}`} className="aspect-square w-full object-cover" onError={() => markImageFailed(image.id)} />
                      )}
                      <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button type="button" onClick={() => setPrimaryImage(image.id)} className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm" aria-label="Set primary image">
                          <Star className={`h-4 w-4 ${index === 0 ? "fill-amber-400 text-amber-500" : ""}`} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeImage(image.id)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100" aria-label="Remove image">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  No product images attached.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IndianRupee className="h-4 w-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Field label="Purchase Price" required error={attemptedSubmit ? errors.purchasePrice : ""}>
                <Input type="number" value={form.purchasePrice} onChange={(event) => updateField("purchasePrice", event.target.value)} />
              </Field>
              <Field label="Wholesale Price">
                <Input type="number" value={form.wholesalePrice} onChange={(event) => updateField("wholesalePrice", event.target.value)} />
              </Field>
              <Field label="Selling Price" required error={attemptedSubmit ? errors.sellingPrice : ""}>
                <Input type="number" value={form.sellingPrice} onChange={(event) => updateField("sellingPrice", event.target.value)} />
              </Field>
              <Field label="Discount %">
                <Input type="number" min="0" max="100" value={form.discount} onChange={(event) => updateField("discount", event.target.value)} />
              </Field>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm text-muted-foreground">Gross Margin</p>
                <p className="mt-2 text-2xl font-semibold">{Number.isFinite(margin) ? margin.toFixed(1) : "0.0"}%</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(toNumber(form.sellingPrice) - toNumber(form.purchasePrice))} per unit</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Warehouse className="h-4 w-4" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="On Hand Stock" required error={attemptedSubmit ? errors.onHandStock : ""}>
                <Input type="number" min="0" value={form.onHandStock} onChange={(event) => updateField("onHandStock", event.target.value)} />
              </Field>
              <Field label="Available Stock">
                <Input type="number" min="0" value={form.availableStock} onChange={(event) => updateField("availableStock", event.target.value)} />
              </Field>
              <Field label="Reserved Stock">
                <Input type="number" min="0" value={form.reservedStock} onChange={(event) => updateField("reservedStock", event.target.value)} />
              </Field>
              <Field label="Reorder Level">
                <Input type="number" min="0" value={form.reorderLevel} onChange={(event) => updateField("reorderLevel", event.target.value)} />
              </Field>
              <Field label="Reorder Quantity">
                <Input type="number" min="0" value={form.reorderQuantity} onChange={(event) => updateField("reorderQuantity", event.target.value)} />
              </Field>
              <Field label="Warehouse">
                <Input value={form.warehouse} onChange={(event) => updateField("warehouse", event.target.value)} />
              </Field>
              <Field label="Batch Number">
                <Input value={form.batchNumber} onChange={(event) => updateField("batchNumber", event.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catalog Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Snapshot label="Supplier" value={product.supplierName ?? "Unassigned supplier"} />
              <Snapshot label="Category" value={categories.find((category) => String(category.id) === form.categoryId)?.name ?? product.categoryName ?? "Uncategorized"} />
              <Snapshot label="Price" value={`${formatCurrency(form.sellingPrice)} / ${unitLabels[form.unitType] ?? form.unitType}`} />
              <Snapshot label="Available Stock" value={form.availableStock || "0"} />
              <Snapshot label="Warehouse" value={form.warehouse || "Unassigned"} />
              <Separator />
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">Status</p>
                <Badge className="mt-2 rounded-md capitalize" variant={form.status === "active" ? "default" : "secondary"}>
                  {form.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Snapshot label="On hand" value={form.onHandStock || "0"} />
              <Snapshot label="Reserved" value={form.reservedStock || "0"} />
              <Snapshot label="Reorder" value={form.reorderLevel || "0"} />
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
