
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Package, 
  History, 
  Users, 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard,
  Sun, 
  Moon 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-md transition-all",
        isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-black"
          : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 'light'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const sidebarItems = [
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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar for desktop */}
      <aside className="w-full md:w-64 border-r border-border bg-white text-gray-800 dark:bg-slate-900 dark:text-white hidden md:block fixed top-0 bottom-0 left-0 z-30">
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/20 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xl font-semibold">Invex AI</span>
          </Link>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-gray-700 dark:text-gray-300">
            {theme === 'light' ? 
              <Moon className="h-5 w-5" /> : 
              <Sun className="h-5 w-5" />
            }
          </Button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href))
              }
            />
          ))}
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden bg-white text-gray-800 dark:bg-slate-900 dark:text-white border-b border-border/20 dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
        <div className="h-16 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xl font-semibold">Invex AI</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-gray-700 dark:text-gray-300">
              {theme === 'light' ? 
                <Moon className="h-5 w-5" /> : 
                <Sun className="h-5 w-5" />
              }
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-gray-700 dark:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                  </>
                )}
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="p-4 space-y-1 bg-white dark:bg-slate-900">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={
                  currentPath === item.href ||
                  (item.href !== "/" && currentPath.startsWith(item.href))
                }
              />
            ))}
          </nav>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-auto md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
