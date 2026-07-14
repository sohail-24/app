import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Leaf,
  Package,
  X,
} from "lucide-react";

const gradeLabels: Record<string, string> = {
  premium: "Premium",
  grade_a: "Grade A",
  grade_b: "Grade B",
  standard: "Standard",
};

const unitLabels: Record<string, string> = {
  kg: "KG",
  lb: "LB",
  case: "Case",
  pallet: "Pallet",
  each: "Each",
  bunch: "Bunch",
  box: "Box",
  bag: "Bag",
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [grade, setGrade] = useState<string>("all");
  const [organic, setOrganic] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: categories } = trpc.category.list.useQuery();
  const {
    data: products,
    isLoading,
  } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
    grade: grade !== "all" ? grade : undefined,
    organic: organic === "true" ? true : organic === "false" ? false : undefined,
    sortBy: sortBy as "price" | "name" | "newest",
  });

  const cartQuery = trpc.cart.list.useQuery(undefined, { retry: false });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      cartQuery.refetch();
    },
  });

  const hasFilters = categoryId !== "all" || grade !== "all" || organic !== "all" || search;

  const clearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setGrade("all");
    setOrganic("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Browse our wholesale catalog of fresh produce
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="outline" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartQuery.data?.count ? (
                <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                  {cartQuery.data.count}
                </Badge>
              ) : null}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, categories, origins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[140px]">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="grade_a">Grade A</SelectItem>
                <SelectItem value="grade_b">Grade B</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={organic} onValueChange={setOrganic}>
              <SelectTrigger className="w-[130px]">
                <Leaf className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Organic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Organic Only</SelectItem>
                <SelectItem value="false">Conventional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low-High</SelectItem>
                <SelectItem value="price_desc">Price: High-Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {search && (
              <Badge variant="secondary" className="text-xs">
                Search: "{search}"
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
              </Badge>
            )}
            {categoryId !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {categories?.find((c) => String(c.id) === categoryId)?.name}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setCategoryId("all")} />
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-emerald-600 hover:underline ml-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading products..." : `${products?.length ?? 0} products found`}
      </p>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <Link to={`/products/${product.slug}`}>
                <div className="relative h-44 bg-muted overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {product.organic && (
                    <Badge className="absolute top-2 left-2 bg-emerald-600 text-white hover:bg-emerald-700">
                      <Leaf className="mr-1 h-3 w-3" />
                      Organic
                    </Badge>
                  )}
                  {product.compareAtPrice && parseFloat(product.compareAtPrice.toString()) > 0 && (
                    <Badge variant="secondary" className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600">
                      Sale
                    </Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {product.categoryName ?? "Uncategorized"}
                    </p>
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-sm leading-tight hover:text-emerald-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{product.origin}</span>
                    <span>·</span>
                    <span>{gradeLabels[product.grade] ?? product.grade}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-emerald-600">
                      ${parseFloat(product.unitPrice?.toString() ?? "0").toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {unitLabels[product.unitType] ?? product.unitType}
                    </span>
                    {product.compareAtPrice && parseFloat(product.compareAtPrice.toString()) > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${parseFloat(product.compareAtPrice.toString()).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: {product.minimumOrderQuantity} {unitLabels[product.unitType] ?? product.unitType}
                    {product.unitSize ? ` · ${product.unitSize}` : ""}
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() =>
                      addToCart.mutate({
                        productId: product.id,
                        quantity: product.minimumOrderQuantity,
                      })
                    }
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium mb-1">No products found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
