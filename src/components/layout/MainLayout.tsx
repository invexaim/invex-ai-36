
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
  Calendar
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
    { icon: <ShoppingCart className="w-5 h-5" />, label: "Sales", href: "/sales" },
    { icon: <History className="w-5 h-5" />, label: "History", href: "/history" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Payments", href: "/payments" },
    { icon: <Users className="w-5 h-5" />, label: "Clients", href: "/clients" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Stock", href: "/stock" },
    { icon: <FileText className="w-5 h-5" />, label: "Estimates", href: "/estimates" },
    { icon: <Truck className="w-5 h-5" />, label: "Delivery", href: "/delivery" },
    { icon: <Calendar className="w-5 h-5" />, label: "Expiry", href: "/expiry" },
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
        currentPath={location.pathname}
        theme={theme as 'light' | 'dark'}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      <div className="md:ml-64">
        {/* Add sync status indicator */}
        <div className="fixed top-4 right-4 z-50">
          <DataSyncStatus />
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>

      <MobileNavigation
        sidebarItems={sidebarItems}
        currentPath={location.pathname}
        theme={theme as 'light' | 'dark'}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default MainLayout;
