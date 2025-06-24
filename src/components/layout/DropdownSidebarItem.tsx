
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuItemType {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface DropdownSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  items: DropdownMenuItemType[];
  isActive: boolean;
}

const DropdownSidebarItem = ({ icon, label, items, isActive }: DropdownSidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(isActive);
  const location = useLocation();

  const isAnyChildActive = items.some(item => location.pathname === item.href);

  React.useEffect(() => {
    if (isAnyChildActive) {
      setIsOpen(true);
    }
  }, [isAnyChildActive]);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 rounded-md transition-all",
          isActive || isAnyChildActive
            ? "bg-slate-900 text-white dark:bg-white dark:text-black"
            : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="ml-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-2 rounded-md transition-all text-sm",
                location.pathname === item.href
                  ? "bg-slate-800 text-white dark:bg-gray-200 dark:text-black"
                  : "hover:bg-gray-100 text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSidebarItem;
