
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";

interface DesktopSidebarProps {
  sidebarItems: SidebarItemType[];
  currentPath: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DesktopSidebar = ({ sidebarItems, currentPath, theme, toggleTheme }: DesktopSidebarProps) => {
  return (
    <aside className="w-full md:w-64 border-r border-border bg-white text-gray-800 dark:bg-slate-900 dark:text-white hidden md:block fixed top-0 bottom-0 left-0 z-30">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/20 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xl font-semibold">Invex AI</span>
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
  );
};

export default DesktopSidebar;
