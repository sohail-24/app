import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { formatCurrency, formatDate, getPurchasePrice, getSku, toNumber, unitLabels } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Eye,
  Filter,
  Grid3X3,
  Image as ImageIcon,
  List,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const gradeLabels: Record<string, string> = {
  premium: "Premium",
  grade_a: "Grade A",
  grade_b: "Grade B",
  standard: "Standard",
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [grade, setGrade] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { user } = useAuth();
  const role = getAppRole(user);
  const ownerMode = role !== "buyer";
  const utils = trpc.useUtils();
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const activeCategories = categoriesQuery.data ?? [];
  const productsQuery = trpc.product.list.useQuery(
    {
      search: search || undefined,
      categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
      grade: grade !== "all" ? grade : undefined,
      status: ownerMode ? undefined : "active",
      sortBy: sort === "name" ? "name" : sort.startsWith("price") ? "price" : "newest",
      sortOrder: sort === "price_asc" || sort === "name" ? "asc" : "desc",
    },
    { retry: false },
  );
  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
      ]);
      setSelected(new Set());
    },
  });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });

  const products = productsQuery.data ?? [];
  const allVisibleSelected = ownerMode && products.length > 0 && products.every((product) => selected.has(product.id));

  const productStats = useMemo(() => {
    const totalValue = products.reduce((total, product) => total + toNumber(product.unitPrice), 0);
    return {
      active: products.filter((product) => product.status === "active").length,
      categories: new Set(products.map((product) => product.categoryId)).size,
      avgPrice: products.length ? totalValue / products.length : 0,
    };
  }, [products]);

  const toggleSelected = (id: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(products.map((product) => product.id)));
  };

  const addProductToCart = (product: (typeof products)[number]) => {
    const quantity = product.minimumOrderQuantity ?? 1;
    if (user) {
      addToCart.mutate({ productId: product.id, quantity });
      return;
    }

    addGuestCartItem({
      id: product.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image,
      productUnitType: product.unitType,
      productUnitSize: product.unitSize,
      quantity,
      unitPrice: String(product.unitPrice),
    });
    toast.success("Product added to cart.");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {ownerMode ? "Product Management" : "Browse Products"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ownerMode
              ? "Manage wholesale SKUs, pricing, categories, availability, and catalog operations."
              : "Search wholesale products, compare supplier options, and build your purchase cart."}
          </p>
        </div>
        {ownerMode ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link to="/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Products" value={products.length} loading={productsQuery.isLoading} />
        <Metric label="Active SKUs" value={productStats.active} loading={productsQuery.isLoading} />
        <Metric label="Categories" value={productStats.categories} loading={productsQuery.isLoading} />
        <Metric label="Avg Selling Price" value={formatCurrency(productStats.avgPrice)} loading={productsQuery.isLoading} />
      </section>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, SKU, category, supplier..."
                className="pl-9"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:flex">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="min-w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {Object.entries(gradeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price_asc">Price Low-High</SelectItem>
                  <SelectItem value="price_desc">Price High-Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border bg-card p-1">
                <Button
                  variant={view === "table" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {ownerMode && !categoriesQuery.isLoading && activeCategories.length === 0 && (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <span>No categories available.</span>
              <Link to="/categories">
                <Button size="sm" variant="outline" className="bg-background">
                  Create Category
                </Button>
              </Link>
            </div>
          )}

      {ownerMode && selected.size > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">{selected.size} products selected</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">Set Active</Button>
                <Button variant="outline" size="sm">Export Selected</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {productsQuery.isLoading ? (
        <ProductSkeleton view={view} />
      ) : productsQuery.error ? (
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-base font-semibold">Could not load products</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {productsQuery.error.message || "Check your connection and try again."}
            </p>
            <Button className="mt-5" variant="outline" onClick={() => productsQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : products.length ? (
        view === "table" ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {ownerMode && (
                      <TableHead className="w-10 pl-4">
                        <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} aria-label="Select all products" />
                      </TableHead>
                    )}
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    {ownerMode && <TableHead>Purchase Price</TableHead>}
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      {ownerMode && (
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selected.has(product.id)}
                            onCheckedChange={() => toggleSelected(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex min-w-[260px] items-center gap-3">
                          <ProductImage src={product.image} alt={product.name} />
                          <div className="min-w-0">
                            <Link to={`/products/${product.slug}`} className="truncate font-medium hover:text-primary">
                              {product.name}
                            </Link>
                            <div className="truncate text-xs text-muted-foreground">
                              {product.supplierName ?? "Unassigned supplier"} · {formatDate(product.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{getSku(product)}</TableCell>
                      <TableCell>{product.categoryName ?? "Uncategorized"}</TableCell>
                      {ownerMode && <TableCell>{formatCurrency(getPurchasePrice(product.unitPrice))}</TableCell>}
                      <TableCell className="font-medium">{formatCurrency(product.unitPrice)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.minimumOrderQuantity} {unitLabels[product.unitType] ?? product.unitType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <RowActions
                          slug={product.slug}
                          onArchive={() => deleteProduct.mutate({ id: product.id })}
                          disabled={deleteProduct.isPending}
                          ownerMode={ownerMode}
                          onAddToCart={() => addProductToCart(product)}
                          cartPending={addToCart.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  <ProductImage src={product.image} alt={product.name} size="large" />
                </div>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/products/${product.slug}`} className="line-clamp-1 font-medium hover:text-primary">
                        {product.name}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{getSku(product)}</p>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-muted/60 p-2">
                      <p className="text-xs text-muted-foreground">{ownerMode ? "Purchase" : "MOQ"}</p>
                      <p className="font-medium">
                        {ownerMode ? formatCurrency(getPurchasePrice(product.unitPrice)) : product.minimumOrderQuantity}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/60 p-2">
                      <p className="text-xs text-muted-foreground">Selling</p>
                      <p className="font-medium">{formatCurrency(product.unitPrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.categoryName ?? "Uncategorized"}</span>
                    <span>MOQ {product.minimumOrderQuantity}</span>
                  </div>
                  {!ownerMode && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => addProductToCart(product)} disabled={addToCart.isPending}>
                        Add to Cart
                      </Button>
                      <Link to={`/products/${product.slug}`}>
                        <Button variant="secondary" size="sm" className="w-full">Request Quote</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No products found</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {ownerMode
                ? "Adjust filters or create your first wholesale SKU with pricing, inventory, and images."
                : "Adjust filters or browse categories to find products for your next purchase order."}
            </p>
            {ownerMode && (
              <Link to="/products/new">
                <Button className="mt-5">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value, loading }: { label: string; value: string | number; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-3 h-7 w-20" /> : <p className="mt-2 text-2xl font-semibold">{value}</p>}
      </CardContent>
    </Card>
  );
}

function ProductImage({
  src,
  alt,
  size = "small",
}: {
  src?: string | null;
  alt: string;
  size?: "small" | "large";
}) {
  const [failed, setFailed] = useState(false);
  const iconSize = size === "large" ? "h-10 w-10" : "h-5 w-5";

  return (
    <div className={size === "large" ? "flex h-full w-full items-center justify-center overflow-hidden bg-muted" : "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-700 dark:from-emerald-950/30 dark:to-sky-950/30 dark:text-emerald-200">
          <ImageIcon className={iconSize} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "active"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200"
      : status === "draft"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
        : "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200";
  return <Badge className={`rounded-md capitalize ${className}`}>{status}</Badge>;
}

function RowActions({
  slug,
  onArchive,
  disabled,
  ownerMode,
  onAddToCart,
  cartPending,
}: {
  slug: string;
  onArchive: () => void;
  disabled?: boolean;
  ownerMode: boolean;
  onAddToCart: () => void;
  cartPending?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/products/${slug}`}>
            <Eye className="h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>
        {ownerMode ? (
          <>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive} disabled={disabled}>Archive</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onAddToCart} disabled={cartPending}>
              Add to Cart
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/products/${slug}`}>Request Quote</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductSkeleton({ view }: { view: "table" | "grid" }) {
  if (view === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <Skeleton className="aspect-[4/3] rounded-b-none" />
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
