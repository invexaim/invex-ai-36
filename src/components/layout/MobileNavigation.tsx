
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";

interface MobileNavigationProps {
  sidebarItems: SidebarItemType[];
  currentPath: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const MobileNavigation = ({ 
  sidebarItems, 
  currentPath, 
  theme, 
  toggleTheme,
  onLogout
}: MobileNavigationProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const clearLocalData = useAppStore(state => state.clearLocalData);

  const handleItemClick = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      // First save any pending data to Supabase
      await onLogout();
      
      // Clear local data
      clearLocalData();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between z-10 md:hidden px-4 bg-background">
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col transition-all duration-700 ease-in-out">
            <div className="px-4 py-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.href} onClick={handleItemClick}>
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={currentPath === item.href}
                  />
                </div>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button 
                onClick={handleLogout} 
                className="flex items-center justify-start w-full text-destructive" 
                variant="ghost"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-semibold ml-3">Invex AI</h1>
      </div>
      <Button 
        onClick={toggleTheme} 
        variant="outline" 
        size="icon"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default MobileNavigation;
