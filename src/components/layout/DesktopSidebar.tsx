
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DesktopSidebarProps {
  sidebarItems: SidebarItemType[];
  currentPath: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DesktopSidebar = ({ sidebarItems, currentPath, theme, toggleTheme }: DesktopSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Error logging out");
    }
  };

  return (
    <aside className="w-full md:w-64 border-r border-border bg-white text-gray-800 dark:bg-slate-900 dark:text-white hidden md:block fixed top-0 bottom-0 left-0 z-30">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/20 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xl font-semibold text-[#9b60d6]">Invex AI</span>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="rounded-full text-gray-700 dark:text-gray-300"
        >
          {theme === 'light' ? 
            <Moon className="h-5 w-5" /> : 
            <Sun className="h-5 w-5" />
          }
        </Button>
      </div>
      <nav className="flex flex-col h-[calc(100%-4rem)] justify-between">
        <div className="p-4 space-y-1">
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
        </div>
        
        {/* Logout button at the bottom */}
        <div className="p-4 border-t border-border/20 dark:border-gray-700 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
