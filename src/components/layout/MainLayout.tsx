
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Calendar, 
  Package, 
  History, 
  Users, 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard
} from "lucide-react";
import DesktopSidebar from "./DesktopSidebar";
import MobileNavigation from "./MobileNavigation";
import { SidebarItemType } from "./types";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 'light'
  );

  useEffect(() => {
    // Update the data-theme attribute on the document element when the theme changes
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const sidebarItems: SidebarItemType[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Products",
      href: "/products",
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: "Sales",
      href: "/sales",
    },
    {
      icon: <History className="w-5 h-5" />,
      label: "History",
      href: "/history",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Payments",
      href: "/payments",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Clients",
      href: "/clients",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-auto pt-16 md:pt-0 md:pr-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Desktop Sidebar - now positioned on the right */}
      <DesktopSidebar 
        sidebarItems={sidebarItems} 
        currentPath={currentPath} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      {/* Mobile Navigation */}
      <MobileNavigation 
        sidebarItems={sidebarItems} 
        currentPath={currentPath} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
    </div>
  );
};

export default MainLayout;
