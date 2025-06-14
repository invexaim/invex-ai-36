import { Moon, Sun, Menu, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import AuthService from "@/services/authService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const saveDataToSupabase = useAppStore(state => state.saveDataToSupabase);
  const { companyName, setCompanyName } = useAppStore();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  
  const handleItemClick = () => {
    setOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      setOpen(false); // Close the mobile menu first
      console.log("Mobile logout triggered");
      
      // First save all data to Supabase to ensure it's persisted
      await saveDataToSupabase();
      console.log("Data saved to Supabase before logout");
      
      // Then sign out using AuthService
      const { error } = await AuthService.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
      // Then call the onLogout function from props
      await onLogout();
      
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleSaveCompanyName = () => {
    setCompanyName(tempCompanyName);
    setIsCompanyDialogOpen(false);
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
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {sidebarItems.map(item => (
                <div key={item.href} onClick={handleItemClick}>
                  <SidebarItem icon={item.icon} label={item.label} href={item.href} isActive={currentPath === item.href} />
                </div>
              ))}
              
              {/* Settings navigation item */}
              <div onClick={handleItemClick}>
                <SidebarItem 
                  icon={<Settings className="w-5 h-5" />} 
                  label="Settings" 
                  href="/settings" 
                  isActive={currentPath === '/settings'} 
                />
              </div>
            </nav>
            <div className="p-4 border-t">
              <Button onClick={handleLogout} className="flex items-center justify-start w-full text-destructive" variant="ghost">
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
      <Button onClick={toggleTheme} variant="outline" size="icon">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default MobileNavigation;
