import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  ShoppingCart,
  Truck,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  Check,
  Star,
  Citrus,
  Apple,
  Grape,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreshFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse Products
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                <Star className="h-3.5 w-3.5" />
                Trusted by 500+ wholesalers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Fresh Produce.
                <br />
                <span className="text-emerald-600">Wholesale Simplified.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                The B2B marketplace connecting fruit suppliers with buyers. Streamline ordering, manage inventory, and grow your business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-base px-8 shadow-lg hover:shadow-xl transition-all">
                    Start Buying
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="text-base px-8">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  No setup fees
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Net-30 terms
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Verified suppliers
                </div>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-6 text-white shadow-lg">
                  <Citrus className="h-8 w-8 mb-3 opacity-90" />
                  <p className="font-semibold text-lg">Citrus</p>
                  <p className="text-sm opacity-80">Oranges, Lemons, Limes</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white shadow-lg">
                  <Grape className="h-8 w-8 mb-3 opacity-90" />
                  <p className="font-semibold text-lg">Grapes</p>
                  <p className="text-sm opacity-80">Table & Wine Varieties</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                  <Apple className="h-8 w-8 mb-3 opacity-90" />
                  <p className="font-semibold text-lg">Apples</p>
                  <p className="text-sm opacity-80">Premium Varieties</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 p-6 text-white shadow-lg">
                  <Leaf className="h-8 w-8 mb-3 opacity-90" />
                  <p className="font-semibold text-lg">Tropical</p>
                  <p className="text-sm opacity-80">Mangoes, Pineapples</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need for wholesale produce</h2>
            <p className="text-muted-foreground text-lg">
              From sourcing to delivery, FreshFlow streamlines every step of your B2B fruit trading workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShoppingCart, title: "Easy Ordering", desc: "Browse catalog, add to cart, and checkout in minutes with wholesale pricing." },
              { icon: Truck, title: "Order Tracking", desc: "Real-time status updates from confirmation to delivery at your door." },
              { icon: Shield, title: "Verified Suppliers", desc: "Every supplier is vetted and verified for quality and reliability." },
              { icon: BarChart3, title: "Inventory Insights", desc: "Track stock levels, get low-stock alerts, and manage your warehouse." },
              { icon: Users, title: "Team Management", desc: "Multiple users per company with role-based access control." },
              { icon: Leaf, title: "Quality Grading", desc: "Premium to standard grades with full organic and certification tracking." },
            ].map((f) => (
              <div key={f.title} className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Active Buyers" },
              { value: "120+", label: "Suppliers" },
              { value: "2,400+", label: "Products" },
              { value: "₹100Cr+", label: "Monthly Volume" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                <p className="text-emerald-100 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to streamline your produce sourcing?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join the leading B2B marketplace for fresh fruit wholesalers. Get started in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-emerald-600 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">FreshFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 FreshFlow. All rights reserved. B2B Wholesale Marketplace for Fresh Produce.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
