
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DesktopSidebarProps {
  sidebarItems: SidebarItemType[];
  currentPath: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const DesktopSidebar = ({ 
  sidebarItems, 
  currentPath, 
  theme, 
  toggleTheme,
  onLogout
}: DesktopSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Desktop logout triggered");
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
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={currentPath === item.href}
          />
        ))}
      </nav>
      <div className="p-4 border-t flex flex-col gap-2">
        <Button 
          onClick={handleLogout} 
          className="flex items-center justify-start text-destructive" 
          variant="ghost"
        >
          <span className="flex items-center gap-3">
            <span>Logout</span>
          </span>
        </Button>
        <Button 
          onClick={toggleTheme} 
          variant="outline" 
          size="icon"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
