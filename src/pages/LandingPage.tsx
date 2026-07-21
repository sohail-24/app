import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Apple,
  Beef,
  Boxes,
  ChevronDown,
  CircleUserRound,
  Droplets,
  Eye,
  Image as ImageIcon,
  Leaf,
  LogIn,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wheat,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatNumber, toNumber, unitLabels } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type MarketplaceProduct = {
  id: number;
  slug: string;
  name: string;
  image?: string | null;
  supplierName?: string | null;
  categoryName?: string | null;
  unitPrice?: string | number | null;
  compareAtPrice?: string | number | null;
  unitType?: string | null;
  unitSize?: string | null;
  minimumOrderQuantity?: number | null;
  stock?: number | string | null;
  rating?: string | number | null;
  grade?: string | null;
  organic?: boolean | null;
  status?: string | null;
};

type MarketplaceCategory = {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
};

const infoStrip = [
  { icon: Truck, label: "Same Day Delivery" },
  { icon: CircleUserRound, label: "Verified Suppliers" },
  { icon: Package, label: "Bulk Orders" },
  { icon: Star, label: "Wholesale Pricing" },
];

const categoryIcons = [Apple, Leaf, Droplets, Wheat, Boxes, Sparkles, Beef, Package];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<"newest" | "price" | "name">("newest");
  const [visibleRecent, setVisibleRecent] = useState(8);
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const productsQuery = trpc.product.list.useQuery(
    {
      search: search.trim() || undefined,
      categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
      status: "active",
      sortBy: sort,
    },
    { retry: false },
  );
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });

  const categories = (categoriesQuery.data ?? []) as MarketplaceCategory[];
  const products = (productsQuery.data ?? []) as MarketplaceProduct[];
  const featuredProducts = products.slice(0, 8);
  const recentProducts = products.slice(8, 8 + visibleRecent);
  const selectedCategory = categories.find((category) => String(category.id) === categoryId);

  const categoryNavItems = useMemo(
    () => [
      { id: "all", name: "All Products" },
      ...categories.map((category) => ({ id: String(category.id), name: category.name })),
    ],
    [categories],
  );

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function addProductToCart(product: MarketplaceProduct, quantity: number) {
    if (!isAuthenticated) {
      const returnTo = `/?product=${encodeURIComponent(product.slug)}`;
      toast.info("Please log in to add wholesale products to your cart.");
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    addToCart.mutate({ productId: product.id, quantity });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4 lg:px-6">
          <div className="grid gap-3 md:grid-cols-[auto_minmax(280px,1fr)_auto] md:items-center">
            <Link to="/" className="flex w-fit items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">FreshFlow</span>
            </Link>

            <form onSubmit={handleSearchSubmit} className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, suppliers, categories..."
                className="h-11 rounded-md border-slate-300 bg-slate-50 pl-10 pr-24 text-base focus-visible:ring-emerald-600"
              />
              <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-800">
                Search
              </Button>
            </form>

            <nav className="flex items-center justify-between gap-2 md:justify-end">
              {isAuthenticated ? (
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserRound className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.name ?? "Profile"}</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
              <Link to="/cart">
                <Button variant="outline" size="sm" className="relative gap-2 border-slate-300">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {!!cartQuery.data?.count && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[11px] font-semibold text-white">
                      {cartQuery.data.count}
                    </span>
                  )}
                </Button>
              </Link>
            </nav>
          </div>

          <div className="-mx-3 overflow-x-auto border-t border-slate-100 px-3 pt-2 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6">
            <div className="flex min-w-max gap-2">
              {categoriesQuery.isLoading ? (
                Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-9 w-24 shrink-0" />)
              ) : (
                categoryNavItems.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={categoryId === category.id ? "default" : "ghost"}
                    size="sm"
                    className={categoryId === category.id ? "shrink-0 bg-emerald-700 hover:bg-emerald-800" : "shrink-0"}
                    onClick={() => setCategoryId(category.id)}
                  >
                    {category.name}
                  </Button>
                ))
              )}
              <Link to="/products">
                <Button variant="ghost" size="sm" className="shrink-0 gap-1">
                  More <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <section className="grid gap-2 rounded-lg border border-emerald-100 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {infoStrip.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950">
              <item.icon className="h-4 w-4 text-emerald-700" />
              {item.label}
            </div>
          ))}
        </section>

        <section className="mt-5 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Wholesale Marketplace</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today's Fresh Deals</h1>
              <p className="mt-1 text-sm text-slate-600">
                Browse active wholesale products before logging in. MOQ, stock, supplier, and price stay visible.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(value) => setSort(value as "newest" | "price" | "name")}>
                <SelectTrigger className="w-36 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCategory && (
            <Badge variant="outline" className="w-fit rounded-md border-emerald-200 bg-white text-emerald-800">
              Browsing {selectedCategory.name}
            </Badge>
          )}

          <ProductGrid
            products={featuredProducts}
            loading={productsQuery.isLoading}
            emptyMessage="No active wholesale products found for this search."
            onAdd={addProductToCart}
            pending={addToCart.isPending}
          />
        </section>

        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Browse by Category</h2>
              <p className="text-sm text-slate-600">Use live product categories managed by suppliers.</p>
            </div>
            <Link to="/products" className="hidden sm:block">
              <Button variant="outline" size="sm">View Catalog</Button>
            </Link>
          </div>

          {categoriesQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-24" />)}
            </div>
          ) : categories.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(String(category.id))}
                    className="flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{category.name}</span>
                      <span className="line-clamp-2 text-sm text-slate-600">{category.description || "Wholesale products and supplier listings"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState message="Categories will appear here after suppliers add them." />
          )}
        </section>

        <section className="mt-8 space-y-3 pb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Recently Added Products</h2>
              <p className="text-sm text-slate-600">
                {products.length ? `${formatNumber(products.length)} active products found` : "Live catalog results from the backend"}
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline" size="sm">Open Full Catalog</Button>
            </Link>
          </div>

          <ProductGrid
            products={recentProducts}
            loading={productsQuery.isLoading}
            emptyMessage="No recent products are available yet."
            onAdd={addProductToCart}
            pending={addToCart.isPending}
            compact
          />

          {products.length > 8 + visibleRecent && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisibleRecent((count) => count + 8)}>
                Load More Products
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ProductGrid({
  products,
  loading,
  emptyMessage,
  onAdd,
  pending,
  compact = false,
}: {
  products: MarketplaceProduct[];
  loading: boolean;
  emptyMessage: string;
  onAdd: (product: MarketplaceProduct, quantity: number) => void;
  pending?: boolean;
  compact?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: compact ? 4 : 8 }).map((_, index) => <Skeleton key={index} className="h-[430px] rounded-lg" />)}
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <WholesaleProductCard key={product.id} product={product} onAdd={onAdd} pending={pending} />
      ))}
    </div>
  );
}

function WholesaleProductCard({
  product,
  onAdd,
  pending,
}: {
  product: MarketplaceProduct;
  onAdd: (product: MarketplaceProduct, quantity: number) => void;
  pending?: boolean;
}) {
  const price = toNumber(product.unitPrice);
  const compareAt = toNumber(product.compareAtPrice);
  const moq = product.minimumOrderQuantity ?? 1;
  const unit = product.unitType ?? "kg";
  const availableStock = product.stock ?? (product.status === "active" ? "Available" : "Limited");
  const [quantity, setQuantity] = useState(moq);
  const unitLabel = unitLabels[unit] ?? unit;
  const total = price * quantity;

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-400">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-10 w-10" />
          )}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div className="min-h-[62px]">
          <Link to={`/products/${product.slug}`} className="line-clamp-2 text-base font-semibold leading-snug hover:text-emerald-700">
            {product.name}
          </Link>
          <p className="mt-1 truncate text-xs text-slate-600">{product.supplierName ?? "Verified Supplier"}</p>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-800">{formatCurrency(price)}</span>
            <span className="text-slate-500">/ {unitLabel}</span>
            {compareAt > price && <span className="text-xs text-slate-400 line-through">{formatCurrency(compareAt)}</span>}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600">
            <span>MOQ: {moq} {unitLabel}</span>
            <span>Available Stock: {availableStock}</span>
            <span>Rating: {product.rating ?? "4.8"}</span>
            <span>{product.categoryName ?? "Wholesale"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white"
            onClick={() => setQuantity(Math.max(moq, quantity - 1))}
            disabled={quantity <= moq}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-20 text-center text-sm font-semibold">
            {quantity} {unitLabel}
          </span>
          <Button type="button" variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Live total</span>
          <span className="font-bold text-slate-950">{formatCurrency(total)}</span>
        </div>

        <div className="grid gap-2">
          <Button
            type="button"
            className="w-full bg-emerald-700 hover:bg-emerald-800"
            onClick={() => onAdd(product, quantity)}
            disabled={pending}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add To Cart
          </Button>
          <Link to={`/products/${product.slug}`}>
            <Button variant="outline" className="w-full border-slate-300">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
      {message}
    </div>
  );
}
