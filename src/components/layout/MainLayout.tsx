import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import DesktopSidebar from "./DesktopSidebar";
import MobileNavigation from "./MobileNavigation";
import { DataSyncStatus } from "./DataSyncStatus";
import { SidebarItemType } from "./types";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  CreditCard,
  Users,
  BarChart3,
  FileText,
  Truck,
  Calendar,
  ShoppingBag,
  Plus,
  List,
  RotateCcw,
  UsersIcon,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  Receipt,
  FolderOpen,
  Tags
} from "lucide-react";
import useAppStore from "@/store/appStore";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const clearLocalData = useAppStore(state => state.clearLocalData);

  const sidebarItems: SidebarItemType[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
    { icon: <Package className="w-5 h-5" />, label: "Products", href: "/products" },
    { icon: <History className="w-5 h-5" />, label: "History", href: "/history" },  
    { icon: <CreditCard className="w-5 h-5" />, label: "Payments", href: "/payments" },
    { icon: <Users className="w-5 h-5" />, label: "Clients", href: "/clients" },
    { icon: <FileText className="w-5 h-5" />, label: "Estimates", href: "/estimates" },
    { icon: <Truck className="w-5 h-5" />, label: "Delivery", href: "/delivery" },
    { icon: <Calendar className="w-5 h-5" />, label: "Expiry", href: "/expiry" },
  ];

  const dropdownItems = [
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: "Sales",
      items: [
        { icon: <Plus className="w-4 h-4" />, label: "New Invoice", href: "/sales/invoices/new" },
        { icon: <List className="w-4 h-4" />, label: "Invoice List", href: "/sales/invoices" },
        { icon: <RotateCcw className="w-4 h-4" />, label: "Sales Returns", href: "/sales/returns" },
        { icon: <UsersIcon className="w-4 h-4" />, label: "Customers", href: "/clients" },
      ]
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Purchases", 
      items: [
        { icon: <Plus className="w-4 h-4" />, label: "New Purchase", href: "/purchases/orders" },
        { icon: <List className="w-4 h-4" />, label: "Purchase List", href: "/purchases/list" },
        { icon: <RotateCcw className="w-4 h-4" />, label: "Purchase Returns", href: "/purchases/returns" },
        { icon: <UsersIcon className="w-4 h-4" />, label: "Supplier Management", href: "/purchases/suppliers" },
      ]
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      label: "Expense",
      items: [
        { icon: <Plus className="w-4 h-4" />, label: "Expense New", href: "/expense/new" },
        { icon: <List className="w-4 h-4" />, label: "Expense List", href: "/expense/list" },
        { icon: <Tags className="w-4 h-4" />, label: "Expense Category", href: "/expense/category" },
        { icon: <FolderOpen className="w-4 h-4" />, label: "Category List", href: "/expense/category-list" },
      ]
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Stock",
      items: [
        { icon: <CheckCircle className="w-4 h-4" />, label: "In Stock", href: "/stock/in-stock" },
        { icon: <AlertTriangle className="w-4 h-4" />, label: "Low Stock", href: "/stock/low-stock" },
        { icon: <AlertCircle className="w-4 h-4" />, label: "Stock Out", href: "/stock/stock-out" },
        { icon: <Clock className="w-4 h-4" />, label: "Short Expiry", href: "/stock/short-expiry" },
        { icon: <AlertTriangle className="w-4 h-4" />, label: "Expiry", href: "/stock/expiry" },
      ]
    }
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      console.log("[LAYOUT] Logout triggered");
      await clearLocalData();
    } catch (error) {
      console.error("[LAYOUT] Error during logout:", error);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar
        sidebarItems={sidebarItems}
        dropdownItems={dropdownItems}
        currentPath={location.pathname}
        theme={theme as 'light' | 'dark'}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      <div className="md:ml-64">
        {/* Move sync status indicator higher up */}
        <div className="fixed top-2 right-4 z-50">
          <DataSyncStatus />
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>

      <MobileNavigation
        sidebarItems={sidebarItems}
        dropdownItems={dropdownItems}
        currentPath={location.pathname}
        theme={theme as 'light' | 'dark'}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default MainLayout;
