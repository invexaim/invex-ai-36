
import { Moon, Sun, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItem from "./SidebarItem";
import DropdownSidebarItem from "./DropdownSidebarItem";
import { SidebarItemType } from "./types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import AuthService from "@/services/authService";
import { useState } from "react";

interface DropdownMenuItemType {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface DropdownSidebarItemType {
  icon: React.ReactNode;
  label: string;
  items: DropdownMenuItemType[];
  href?: string;
}

interface DesktopSidebarProps {
  sidebarItems: SidebarItemType[];
  dropdownItems: DropdownSidebarItemType[];
  currentPath: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const DesktopSidebar = ({
  sidebarItems,
  dropdownItems,
  currentPath,
  theme,
  toggleTheme,
  onLogout
}: DesktopSidebarProps) => {
  const navigate = useNavigate();
  const saveDataToSupabase = useAppStore(state => state.saveDataToSupabase);
  const {
    companyName,
    setCompanyName
  } = useAppStore();

  const handleLogout = async () => {
    try {
      console.log("Desktop logout triggered");

      // First save all data to Supabase to ensure it's persisted before logout
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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border hidden md:flex flex-col">
      <div className="px-4 py-6 border-b">
        <h1 className="text-xl font-semibold">Invex AI</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {sidebarItems.map(item => (
          <SidebarItem 
            key={item.href} 
            icon={item.icon} 
            label={item.label} 
            href={item.href} 
            isActive={currentPath === item.href} 
          />
        ))}
        
        {dropdownItems.map(dropdownItem => (
          <DropdownSidebarItem
            key={dropdownItem.label}
            icon={dropdownItem.icon}
            label={dropdownItem.label}
            items={dropdownItem.items}
            isActive={dropdownItem.href ? currentPath === dropdownItem.href : false}
          />
        ))}
        
        {/* Settings navigation item */}
        <SidebarItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          href="/settings" 
          isActive={currentPath === '/settings'} 
        />
      </nav>
      <div className="p-4 border-t flex flex-col gap-2">
        <Button onClick={handleLogout} className="flex items-center justify-start text-destructive" variant="ghost">
          <span className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </span>
        </Button>
        <Button onClick={toggleTheme} variant="outline" size="icon">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
