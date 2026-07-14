import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { LOGIN_PATH } from "@/const";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Warehouse,
  BarChart3,
  Store,
  Settings,
  LogOut,
  Leaf,
  ChevronRight,
  User,
} from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router";
import { AuthLayoutSkeleton } from "./AuthLayoutSkeleton";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { trpc } from "@/providers/trpc";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Store, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "Cart", path: "/cart", badge: "cartCount" },
  { icon: ClipboardList, label: "Orders", path: "/orders" },
  { icon: Warehouse, label: "Inventory", path: "/inventory" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

const bottomNavItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "ff-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function AppLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { isLoading } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (isLoading) {
    return <AuthLayoutSkeleton />;
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <AppLayoutContent sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
    </SidebarProvider>
  );
}

function AppLayoutContent({
  sidebarWidth,
  setSidebarWidth,
}: {
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [isResizing, setIsResizing] = useState(false);

  // Get cart count
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const cartCount = cartQuery.data?.count ?? 0;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const renderNavItems = (items: typeof mainNavItems) =>
    items.map((item) => {
      const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
      return (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton
            isActive={isActive}
            onClick={() => navigate(item.path)}
            tooltip={item.label}
            className="h-10 transition-all"
          >
            <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-muted-foreground"}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge === "cartCount" && cartCount > 0 && (
              <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {cartCount}
              </Badge>
            )}
            {isActive && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="h-16 justify-center px-4">
          <Link to="/" className="flex items-center gap-3 transition-all">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-md">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none">FreshFlow</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">B2B Wholesale</span>
              </div>
            )}
          </Link>
        </SidebarHeader>

        <SidebarContent className="gap-1 px-2">
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">
              {isCollapsed ? "..." : "Main"}
            </p>
            <SidebarMenu className="gap-0.5">
              {renderNavItems(mainNavItems)}
            </SidebarMenu>
          </div>
          <div className="px-2 py-2 mt-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">
              {isCollapsed ? "..." : "Account"}
            </p>
            <SidebarMenu className="gap-0.5">
              {renderNavItems(bottomNavItems)}
            </SidebarMenu>
          </div>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-emerald-100 text-emerald-700">
                      {user.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.role === "admin" ? "Administrator" : "Member"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{user.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email || user.phone || ""}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate(LOGIN_PATH)}
              size={isCollapsed ? "icon" : "sm"}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <User className={isCollapsed ? "h-4 w-4" : "mr-2 h-4 w-4"} />
              {!isCollapsed && "Sign in"}
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      {!isCollapsed && (
        <div
          className="fixed top-0 z-50 h-full w-1 cursor-col-resize hover:bg-emerald-500/30 transition-colors"
          style={{ left: `${sidebarWidth - 2}px` }}
          onMouseDown={() => setIsResizing(true)}
        />
      )}

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center px-4 bg-background/95 backdrop-blur sticky top-0 z-40">
            <span className="font-semibold text-sm">FreshFlow</span>
          </div>
        )}
        <main className="flex-1 p-6 min-h-0"><Outlet /></main>
      </SidebarInset>
    </>
  );
}
