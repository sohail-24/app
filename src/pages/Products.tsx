import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { formatCurrency, toNumber, unitLabels } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { categories, productSamples } from "@/lib/freshflowData";
import { MetricCard } from "@/components/freshflow/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";

export default function Products() {
  const { user } = useAuth();
  const role = getAppRole(user);
  const ownerMode = role !== "buyer";

  if (ownerMode) {
    return <OwnerProductCatalog />;
  }

  return <BuyerMarketplace />;
}

function BuyerMarketplace() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState("newest");
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const productsQuery = trpc.product.list.useQuery(
    {
      search: search || undefined,
      categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
      status: "active",
      sortBy: sort === "price" ? "price" : "newest",
    },
    { retry: false },
  );
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });

  const products = productsQuery.data?.length ? productsQuery.data : productSamples;
  const activeCategories = categoriesQuery.data ?? [];

  function addProductToCart(product: any) {
    const quantity = product.minimumOrderQuantity ?? product.moq ?? 1;
    if (user && "id" in product && !("icon" in product)) {
      addToCart.mutate({ productId: product.id, quantity });
      return;
    }

    addGuestCartItem({
      id: product.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image ?? null,
      productUnitType: product.unitType ?? product.unit,
      productUnitSize: product.unitSize ?? product.unit,
      quantity,
      unitPrice: String(product.unitPrice ?? product.price),
    });
    toast.success("Product added to cart.");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
      <section className="rounded-lg border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <ArrowLeft className="h-4 w-4" />
            FreshFlow
          </Link>
          <div className="relative flex-1 lg:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search products..." />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon"><ShoppingCart className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Star className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-3">
          {categories.map((category) => (
            <Button key={category} variant="ghost" className="shrink-0">
              {category}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Filters</h2>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FilterCheck label="Fruits" />
            <FilterCheck label="Vegetables" />
            <FilterCheck label="Dairy" />
            <FilterCheck label="Grocery" />
            <div className="space-y-2">
              <Label>Price</Label>
              <div className="rounded-md border p-3 text-sm text-muted-foreground">₹0 ───── ₹1000</div>
            </div>
            <FilterCheck label="India" checked />
            <FilterCheck label="Imported" />
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Suppliers</SelectItem></SelectContent>
              </Select>
            </div>
            <FilterCheck label="In Stock" checked />
            <FilterCheck label="Low Stock" />
            <FilterCheck label="Out of Stock" />
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="text-sm">★★★★★</div>
              <div className="text-sm">★★★★☆</div>
            </div>
            <Button variant="outline" className="w-full">Reset Filters</Button>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" />Price</Button>
                <Button variant="outline"><Star className="mr-2 h-4 w-4" />Rating</Button>
              </div>
              <p className="text-sm font-medium">{products.length || 248} Products</p>
            </CardContent>
          </Card>

          {productsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80" />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} onAdd={() => addProductToCart(product)} pending={addToCart.isPending} />
              ))}
            </div>
          )}

          <div className="flex justify-center gap-2 py-4">
            <Button variant="outline">Previous</Button>
            {[1, 2, 3, 4, 5].map((page) => <Button key={page} variant={page === 1 ? "default" : "outline"} size="icon">{page}</Button>)}
            <Button variant="outline">Next</Button>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, pending }: { product: any; onAdd: () => void; pending?: boolean }) {
  const price = toNumber(product.unitPrice ?? product.price);
  const moq = product.minimumOrderQuantity ?? product.moq ?? 1;
  const unit = product.unitType ?? product.unit ?? "kg";
  const [quantity, setQuantity] = useState(moq);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
        {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : product.icon ?? <ImageIcon className="h-9 w-9" />}
      </div>
      <CardContent className="space-y-3 p-4 text-sm">
        <div>
          <Link to={`/products/${product.slug}`} className="text-base font-semibold hover:text-primary">{product.name}</Link>
          <p className="text-xs text-muted-foreground">{product.supplierName ?? product.supplier ?? "Supplier"}</p>
        </div>
        <div className="grid gap-1 text-muted-foreground">
          <p><span className="font-medium text-foreground">{formatCurrency(price)}</span> / {unitLabels[unit] ?? unit}</p>
          <p>Stock {product.stock ?? "Backend"}</p>
          <p>MOQ {moq} {unit}</p>
          <p>Rating {product.rating ?? "4.8"}</p>
        </div>
        <div className="flex items-center justify-between rounded-md border p-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity(Math.max(moq, quantity - 1))}>
            <Minus className="h-3 w-3" />
          </Button>
          <span>{quantity}{unit}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <p className="font-semibold">Total {formatCurrency(price * quantity)}</p>
        <div className="grid gap-2">
          <Link to={`/products/${product.slug}`}><Button variant="outline" className="w-full"><Eye className="mr-2 h-4 w-4" />View Details</Button></Link>
          <Button onClick={onAdd} disabled={pending} className="w-full bg-emerald-600 hover:bg-emerald-700">Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OwnerProductCatalog() {
  const [search, setSearch] = useState("");
  const productsQuery = trpc.product.list.useQuery({ search: search || undefined, sortBy: "newest" }, { retry: false });
  const products = productsQuery.data ?? [];
  const stats = useMemo(() => ({
    active: products.filter((product) => product.status === "active").length,
    categories: new Set(products.map((product) => product.categoryId)).size,
    avgPrice: products.length ? products.reduce((sum, product) => sum + toNumber(product.unitPrice), 0) / products.length : 0,
  }), [products]);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Product Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage wholesale SKUs, categories, pricing, and availability.</p>
        </div>
        <Link to="/products/new"><Button><Plus className="mr-2 h-4 w-4" />Add Product</Button></Link>
      </section>
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard title="Products" value={products.length} loading={productsQuery.isLoading} />
        <MetricCard title="Active SKUs" value={stats.active} loading={productsQuery.isLoading} />
        <MetricCard title="Categories" value={stats.categories} loading={productsQuery.isLoading} />
        <MetricCard title="Avg Selling Price" value={formatCurrency(stats.avgPrice)} loading={productsQuery.isLoading} />
      </section>
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search products, SKU, category, supplier..." />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="divide-y p-0">
          {productsQuery.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="m-4 h-14" />)
          ) : products.length ? (
            products.map((product) => (
              <Link key={product.id} to={`/products/${product.slug}`} className="grid gap-3 p-4 hover:bg-muted/40 md:grid-cols-[1fr_160px_120px_100px]">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.categoryName ?? "Uncategorized"} · {product.supplierName ?? "Supplier"}</p>
                </div>
                <p className="font-medium">{formatCurrency(product.unitPrice)}</p>
                <Badge variant="secondary" className="w-fit capitalize">{product.status}</Badge>
                <p className="text-sm text-muted-foreground">MOQ {product.minimumOrderQuantity}</p>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">No products found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterCheck({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <Label className="flex items-center gap-2 text-sm">
      <Checkbox defaultChecked={checked} />
      {label}
    </Label>
  );
}
