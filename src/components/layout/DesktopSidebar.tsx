import { Moon, Sun, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import AuthService from "@/services/authService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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
  const saveDataToSupabase = useAppStore(state => state.saveDataToSupabase);
  const {
    companyName,
    setCompanyName
  } = useAppStore();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  const handleLogout = async () => {
    try {
      console.log("Desktop logout triggered");

      // First save all data to Supabase to ensure it's persisted before logout
      await saveDataToSupabase();
      console.log("Data saved to Supabase before logout");

      // Then sign out using AuthService
      const {
        error
      } = await AuthService.signOut();
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
  return <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border hidden md:flex flex-col">
      <div className="px-4 py-6 border-b">
        <h1 className="text-xl font-semibold">Invex AI</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {sidebarItems.map(item => <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} isActive={currentPath === item.href} />)}
        
        {/* Company Settings below Delivery */}
        <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-md transition-all hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
              <Settings className="w-5 h-5" />
              <span className="font-medium"> Settings</span>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Company Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" value={tempCompanyName} onChange={e => setTempCompanyName(e.target.value)} placeholder="Enter your company name" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCompanyName}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
    </aside>;
};
export default DesktopSidebar;