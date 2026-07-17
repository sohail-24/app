import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, toNumber } from "@/lib/i18n";
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
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Barcode,
  Boxes,
  ImagePlus,
  IndianRupee,
  Package,
  Save,
  Star,
  UploadCloud,
  Warehouse,
  X,
} from "lucide-react";

type ImagePreview = {
  id: string;
  name: string;
  size: number;
  url: string;
};

export default function AddProduct() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageUrlsRef = useRef<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [publish, setPublish] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    description: "",
    purchasePrice: "",
    sellingPrice: "",
    openingStock: "0",
    minimumStock: "10",
    warehouse: "Main Warehouse",
  });

  const utils = trpc.useUtils();
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const activeCategories = categoriesQuery.data ?? [];
  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
      ]);
      toast.success("Product published successfully.");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error.message || "Could not save product. Please try again.");
    },
  });
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
    warehouse: form.warehouse.trim() ? "" : "Warehouse is required.",
  };
  const isFormValid = Object.values(errors).every((error) => !error);

  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addFiles = (files: FileList | File[]) => {
    const nextImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      }));
    imageUrlsRef.current.push(...nextImages.map((image) => image.url));
    setImages((current) => {
      const merged = [...current, ...nextImages].slice(0, 8);
      if (!primaryImageId && merged[0]) setPrimaryImageId(merged[0].id);
      return merged;
    });
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = current.filter((image) => image.id !== id);
      if (primaryImageId === id) setPrimaryImageId(next[0]?.id ?? null);
      return next;
    });
  };

  const moveImage = (id: string, direction: "up" | "down") => {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(swapIndex, 0, item);
      return next;
    });
  };

  const saveProduct = (status: "draft" | "active") => {
    setAttemptedSubmit(true);
    if (!isFormValid) {
      toast.error("Complete the required product fields before saving.");
      return;
    }

    const orderedImages = [
      ...images.filter((image) => image.id === primaryImageId),
      ...images.filter((image) => image.id !== primaryImageId),
    ];
    createProduct.mutate({
      name: form.name,
      sku: form.sku,
      barcode: form.barcode || undefined,
      categoryId: Number(form.categoryId),
      description: form.description || undefined,
      purchasePrice: toNumber(form.purchasePrice),
      sellingPrice: toNumber(form.sellingPrice),
      openingStock: Math.max(0, Math.floor(toNumber(form.openingStock))),
      minimumStock: Math.max(0, Math.floor(toNumber(form.minimumStock))),
      warehouse: form.warehouse,
      status,
      images: orderedImages.map((image) => image.url),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/products" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a wholesale SKU with images, pricing, stock controls, and warehouse placement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Switch checked={publish} onCheckedChange={setPublish} id="publish-switch" />
            <Label htmlFor="publish-switch" className="text-sm">{publish ? "Publish" : "Draft"}</Label>
          </div>
          <Button variant="outline" onClick={() => saveProduct("draft")} disabled={!isFormValid || createProduct.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => saveProduct(publish ? "active" : "draft")} disabled={!isFormValid || createProduct.isPending}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {createProduct.isPending ? "Saving..." : publish ? "Publish Product" : "Save Product"}
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
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Premium Alphonso Mango" />
              </Field>
              <Field label="Category" required error={attemptedSubmit ? errors.categoryId : ""}>
                <Select value={form.categoryId} onValueChange={(value) => updateField("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.length ? (
                      activeCategories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No categories available.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!categoriesQuery.isLoading && activeCategories.length === 0 && (
                  <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                    <span>No categories available.</span>
                    <Link to="/categories">
                      <Button size="sm" variant="outline" className="h-7 bg-background">
                        Create Category
                      </Button>
                    </Link>
                  </div>
                )}
              </Field>
              <Field label="SKU" required error={attemptedSubmit ? errors.sku : ""}>
                <Input value={form.sku} onChange={(event) => updateField("sku", event.target.value)} placeholder="FRU-MANG-0001" />
              </Field>
              <Field label="Barcode">
                <div className="relative">
                  <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} placeholder="8901234567890" className="pl-9" />
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <Textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Describe grade, origin, shelf life, packaging, and wholesale handling notes."
                    className="min-h-28"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImagePlus className="h-4 w-4" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "bg-muted/30 hover:bg-muted/50"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  addFiles(event.dataTransfer.files);
                }}
              >
                <UploadCloud className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drop product images here or click to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload up to 8 images for gallery, labels, and packaging.</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {images.map((image) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                      <img src={image.url} alt={image.name} className="aspect-square w-full object-cover" />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => setPrimaryImageId(image.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm"
                          aria-label="Set primary image"
                        >
                          <Star className={`h-4 w-4 ${primaryImageId === image.id ? "fill-amber-400 text-amber-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => moveImage(image.id, "up")}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm"
                          aria-label="Move image earlier"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveImage(image.id, "down")}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm"
                          aria-label="Move image later"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-background/90 p-2 text-xs">
                        <p className="truncate font-medium">
                          {image.name}
                          {primaryImageId === image.id && <span className="ml-1 text-amber-600">Primary</span>}
                        </p>
                        <p className="text-muted-foreground">{Math.round(image.size / 1024)} KB</p>
                      </div>
                    </div>
                  ))}
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
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Purchase Price" required error={attemptedSubmit ? errors.purchasePrice : ""}>
                <Input type="number" value={form.purchasePrice} onChange={(event) => updateField("purchasePrice", event.target.value)} placeholder="1200" />
              </Field>
              <Field label="Selling Price" required error={attemptedSubmit ? errors.sellingPrice : ""}>
                <Input type="number" value={form.sellingPrice} onChange={(event) => updateField("sellingPrice", event.target.value)} placeholder="1600" />
              </Field>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm text-muted-foreground">Gross Margin</p>
                <p className="mt-2 text-2xl font-semibold">{Number.isFinite(margin) ? margin.toFixed(1) : "0.0"}%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(toNumber(form.sellingPrice) - toNumber(form.purchasePrice))} per unit
                </p>
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
              <Field label="Opening Stock">
                <Input type="number" value={form.openingStock} onChange={(event) => updateField("openingStock", event.target.value)} />
              </Field>
              <Field label="Minimum Stock">
                <Input type="number" value={form.minimumStock} onChange={(event) => updateField("minimumStock", event.target.value)} />
              </Field>
              <Field label="Warehouse" required error={attemptedSubmit ? errors.warehouse : ""}>
                <Input value={form.warehouse} onChange={(event) => updateField("warehouse", event.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadinessRow label="Product details" complete={!!form.name && !!form.sku && !!form.categoryId} />
              <ReadinessRow label="Images" complete={images.length > 0} />
              <ReadinessRow label="Pricing" complete={!!form.purchasePrice && !!form.sellingPrice} />
              <ReadinessRow label="Inventory" complete={toNumber(form.openingStock) >= 0 && !!form.warehouse} />
              <Separator />
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">Status</p>
                <Badge className="mt-2 rounded-md" variant={publish ? "default" : "secondary"}>
                  {publish ? "Ready to publish" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Snapshot icon={Boxes} label="Opening stock" value={form.openingStock || "0"} />
              <Snapshot icon={Warehouse} label="Warehouse" value={form.warehouse || "Not set"} />
              <Snapshot icon={IndianRupee} label="Selling price" value={form.sellingPrice ? formatCurrency(form.sellingPrice) : "Not set"} />
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

function ReadinessRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={complete ? "default" : "outline"} className="rounded-md">
        {complete ? "Complete" : "Needed"}
      </Badge>
    </div>
  );
}

function Snapshot({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
